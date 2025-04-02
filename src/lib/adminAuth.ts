// src/lib/adminAuth.ts
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Check if a user is an admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', userId));
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Register as admin
export const adminRegister = async (name: string, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store admin data in Firestore
    await setDoc(doc(db, 'admins', user.uid), {
      name,
      email,
      role: 'admin',
      createdAt: new Date(),
    });
    
    return user;
  } catch (error) {
    console.error('Error registering admin:', error);
    throw error;
  }
};

// Admin sign in
export const adminSignIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user is actually an admin
    const isUserAdmin = await isAdmin(user.uid);
    if (!isUserAdmin) {
      await signOut(auth);
      throw new Error('Access denied. You are not an admin.');
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in admin:', error);
    throw error;
  }
};

// Admin sign out
export const adminSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out admin:', error);
    throw error;
  }
};

// Check if admin is authenticated
export const adminCheckAuth = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        try {
          const adminStatus = await isAdmin(user.uid);
          resolve(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          resolve(false);
        }
      } else {
        resolve(false);
      }
    }, reject);
  });
};

// Get current admin data
export const getAdminData = async (userId: string) => {
  try {
    const docRef = doc(db, 'admins', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting admin data:', error);
    throw error;
  }
};

// Custom hook for admin authentication
export const useAdminAuth = () => {
  const [admin, setAdmin] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if the user is an admin
        const adminStatus = await isAdmin(user.uid);
        if (adminStatus) {
          const adminData = await getAdminData(user.uid);
          setAdmin({ user, ...adminData });
        } else {
          setAdmin(null);
          router.push('/admin/login');
        }
      } else {
        setAdmin(null);
        router.push('/admin/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  return { admin, loading, adminSignOut };
};