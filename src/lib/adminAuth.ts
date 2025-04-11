// src/lib/adminAuth.ts
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { setupSessionTimeout, checkSessionTimeout, resetSession } from '@/utils/sessionTimeout';

// 5 minutes for admin session timeout - stricter than regular users
const ADMIN_TIMEOUT_MS = 5 * 60 * 1000;

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
    
    // Set up session timeout
    setupSessionTimeout(ADMIN_TIMEOUT_MS);
    
    return user;
  } catch (error) {
    console.error('Error signing in admin:', error);
    throw error;
  }
};

// Admin sign out
export const adminSignOut = async () => {
  try {
    resetSession();
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
          // Check for session timeout
          if (checkSessionTimeout(ADMIN_TIMEOUT_MS)) {
            // Session expired, sign out
            await adminSignOut();
            resolve(false);
            return;
          }
          
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
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiring, setSessionExpiring] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(ADMIN_TIMEOUT_MS);
  const router = useRouter();

  // Function to handle session expiration
  const handleSessionExpiration = useCallback(async () => {
    try {
      await adminSignOut();
      router.push('/admin/login?session=expired');
    } catch (error) {
      console.error("Error signing out admin:", error);
    }
  }, [router]);
  
  // Check session status periodically
  useEffect(() => {
    if (!admin) return;
    
    // Check every 15 seconds if session is about to expire (more frequent for admin)
    const intervalId = setInterval(() => {
      const lastActivityTimestamp = localStorage.getItem('lastActivityTimestamp');
      const remaining = lastActivityTimestamp 
        ? ADMIN_TIMEOUT_MS - (Date.now() - parseInt(lastActivityTimestamp)) 
        : ADMIN_TIMEOUT_MS;
        
      setTimeRemaining(remaining);
      
      // If less than 1 minute remaining, show warning
      if (remaining < 60000 && remaining > 0) {
        setSessionExpiring(true);
      } else {
        setSessionExpiring(false);
      }
      
      // If session has expired, log out
      if (checkSessionTimeout(ADMIN_TIMEOUT_MS)) {
        handleSessionExpiration();
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, [admin, handleSessionExpiration]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check for session timeout
          if (checkSessionTimeout(ADMIN_TIMEOUT_MS)) {
            // Session expired, sign out
            await adminSignOut();
            setAdmin(null);
            router.push('/admin/login?session=expired');
            setLoading(false);
            return;
          }
          
          // Check if the user is an admin
          const adminStatus = await isAdmin(user.uid);
          if (adminStatus) {
            const adminData = await getAdminData(user.uid);
            if (adminData) {
              setAdmin({ user, ...adminData });
            } else {
              setAdmin({ user });
            }
          } else {
            setAdmin(null);
            router.push('/admin/login');
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
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

  const extendSession = () => {
    localStorage.setItem('lastActivityTimestamp', Date.now().toString());
    setSessionExpiring(false);
  };

  return { 
    admin, 
    loading, 
    adminSignOut,
    sessionExpiring,
    timeRemaining,
    resetSession: extendSession
  };
};