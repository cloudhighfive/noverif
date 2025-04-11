// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, getUserData, signIn, signUp, signOut } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';
import { setupSessionTimeout, checkSessionTimeout, resetSession } from '@/utils/sessionTimeout';

// 5 minutes for admin, 15 minutes for regular users
const USER_TIMEOUT_MS = 15 * 60 * 1000;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [sessionExpiring, setSessionExpiring] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(USER_TIMEOUT_MS);
  const router = useRouter();

  // Function to handle session expiration
  const handleSessionExpiration = useCallback(async () => {
    try {
      await signOut();
      resetSession();
      router.push('/login?session=expired');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [router]);

  // Check session status periodically
  useEffect(() => {
    if (!user) return;
    
    // Check every 30 seconds if session is about to expire
    const intervalId = setInterval(() => {
      const lastActivityTimestamp = localStorage.getItem('lastActivityTimestamp');
      const remaining = lastActivityTimestamp 
        ? USER_TIMEOUT_MS - (Date.now() - parseInt(lastActivityTimestamp)) 
        : USER_TIMEOUT_MS;
      
      setTimeRemaining(remaining);
      
      // If less than 1 minute remaining, show warning
      if (remaining < 60000 && remaining > 0) {
        setSessionExpiring(true);
      } else {
        setSessionExpiring(false);
      }
      
      // If session has expired, log out
      if (checkSessionTimeout(USER_TIMEOUT_MS)) {
        handleSessionExpiration();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user, handleSessionExpiration]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const profile = await getUserData(currentUser.uid);
          
          // Check if profile has all the required UserProfile properties
          if (profile && 
              typeof profile === 'object' && 
              'name' in profile && 
              'email' in profile && 
              'virtualBankStatus' in profile && 
              'wallets' in profile) {
            // Type assertion since we've verified it has the required properties
            setUserData(profile as UserProfile);
            
            // Check suspended status
            if ('suspended' in profile) {
              setIsSuspended(profile.suspended === true);
            } else {
              setIsSuspended(false);
            }
          } else {
            console.warn("User profile data is incomplete:", profile);
            setUserData(null);
          }
          
          // Set up session timeout
          setupSessionTimeout(USER_TIMEOUT_MS);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
        setIsSuspended(false);
        resetSession();
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
      resetSession();
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  const extendSession = () => {
    localStorage.setItem('lastActivityTimestamp', Date.now().toString());
    setSessionExpiring(false);
  };

  return {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isSuspended,
    sessionExpiring,
    timeRemaining,
    resetSession: extendSession
  };
}