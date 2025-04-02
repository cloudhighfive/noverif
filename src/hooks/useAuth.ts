// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, getUserData, signIn, signUp, signOut } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          setUserData(userData);
          setIsSuspended(userData?.suspended === true);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
        setIsSuspended(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: any) => {
    try {
      await signUp(email, password, userData);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isSuspended
  };
}