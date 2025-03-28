// src/app/dashboard/settings/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { updateDoc, doc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Lock, User, Mail, Phone, MapPin } from 'lucide-react';

// Password change schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

// Profile schema (only wallet address can be edited by the user)
const profileSchema = z.object({
  walletAddress: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { isAuthenticated, loading, user, userData } = useAuth();
  const router = useRouter();
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      walletAddress: userData?.walletAddress || '',
    },
  });
  
  // Set default value for profile form once user data is loaded
  useEffect(() => {
    if (userData) {
      profileForm.reset({
        walletAddress: userData.walletAddress || '',
      });
    }
  }, [userData, profileForm.reset]);
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);
  
  const onSaveProfile = async (data: ProfileFormData) => {
    if (!user) return;
    
    try {
      setSavingProfile(true);
      setProfileError(null);
      
      // Update user document with the new wallet address
      await updateDoc(doc(db, 'users', user.uid), {
        walletAddress: data.walletAddress,
        updatedAt: new Date(),
      });
      
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError('Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };
  
  const onChangePassword = async (data: PasswordFormData) => {
    if (!user || !user.email) return;
    
    try {
      setChangingPassword(true);
      setPasswordError(null);
      
      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update the password
      await updatePassword(user, data.newPassword);
      
      // Reset form and show success message
      passwordForm.reset();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/wrong-password') {
        setPasswordError('The current password is incorrect.');
      } else if (error.code === 'auth/too-many-requests') {
        setPasswordError('Too many failed attempts. Please try again later.');
      } else {
        setPasswordError('Failed to change password. Please try again.');
      }
    } finally {
      setChangingPassword(false);
    }
  };
  
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-950">
      <DashboardSidebar />
      <DashboardHeader />
      
      <main className="pt-24 pb-12 pl-64">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-display font-bold mb-6">Settings</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Settings */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your account settings
                  </CardDescription>
                </CardHeader>
                <form onSubmit={profileForm.handleSubmit(onSaveProfile)}>
                  <CardContent className="space-y-4">
                    {/* Personal Information - Disabled fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">
                          <User className="inline-block w-4 h-4 mr-1" />
                          Full Name
                        </label>
                        <Input
                          value={userData?.name || ''}
                          disabled
                          className="bg-dark-900/50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">Contact support to update</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">
                          <Mail className="inline-block w-4 h-4 mr-1" />
                          Email Address
                        </label>
                        <Input
                          value={userData?.email || ''}
                          disabled
                          className="bg-dark-900/50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">Contact support to update</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">
                          <Phone className="inline-block w-4 h-4 mr-1" />
                          Phone Number
                        </label>
                        <Input
                          value={userData?.phone || ''}
                          disabled
                          className="bg-dark-900/50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">Contact support to update</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">
                          <MapPin className="inline-block w-4 h-4 mr-1" />
                          Address
                        </label>
                        <Input
                          value={userData?.address || ''}
                          disabled
                          className="bg-dark-900/50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">Contact support to update</p>
                      </div>
                    </div>
                    
                    {/* Wallet Address - Editable */}
                    <div className="space-y-2">
                      <label htmlFor="walletAddress" className="block text-sm font-medium text-white">
                        Default Wallet Address
                      </label>
                      <Input
                        id="walletAddress"
                        {...profileForm.register('walletAddress')}
                        placeholder="Enter your default cryptocurrency wallet address"
                      />
                      <p className="text-xs text-gray-400">
                        This address will be used as the default for cryptocurrency transactions
                      </p>
                    </div>
                    
                    {profileSuccess && (
                      <div className="bg-green-900/20 border border-green-900/30 rounded-md p-3">
                        <p className="text-green-500 text-sm">Profile updated successfully!</p>
                      </div>
                    )}
                    
                    {profileError && (
                      <div className="bg-red-900/20 border border-red-900/30 rounded-md p-3">
                        <p className="text-red-500 text-sm">{profileError}</p>
                      </div>
                    )}
                    
                    <div className="bg-dark-900 p-4 rounded-lg mt-4">
                      <div className="flex items-start">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary-500 mr-2 mt-0.5 fill-current">
                          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/>
                        </svg>
                        <div>
                          <p className="text-gray-300 text-sm">
                            To update your name, email, phone, or address, please contact support at{' '}
                            <a href="mailto:support@swiftpay.com" className="text-primary-500 hover:underline">
                              support@swiftpay.com
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      leftIcon={<Save size={16} />}
                      isLoading={savingProfile}
                    >
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
            
            {/* Password Change */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <form onSubmit={passwordForm.handleSubmit(onChangePassword)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <Input
                        id="currentPassword"
                        type="password"
                        label="Current Password"
                        placeholder="Enter your current password"
                        error={passwordForm.formState.errors.currentPassword?.message}
                        {...passwordForm.register('currentPassword')}
                      />
                      
                      <Input
                        id="newPassword"
                        type="password"
                        label="New Password"
                        placeholder="Enter your new password"
                        error={passwordForm.formState.errors.newPassword?.message}
                        {...passwordForm.register('newPassword')}
                      />
                      
                      <Input
                        id="confirmPassword"
                        type="password"
                        label="Confirm New Password"
                        placeholder="Confirm your new password"
                        error={passwordForm.formState.errors.confirmPassword?.message}
                        {...passwordForm.register('confirmPassword')}
                      />
                    </div>
                    
                    {passwordSuccess && (
                      <div className="bg-green-900/20 border border-green-900/30 rounded-md p-3">
                        <p className="text-green-500 text-sm">Password changed successfully!</p>
                      </div>
                    )}
                    
                    {passwordError && (
                      <div className="bg-red-900/20 border border-red-900/30 rounded-md p-3">
                        <p className="text-red-500 text-sm">{passwordError}</p>
                      </div>
                    )}
                    
                    <div className="bg-dark-900 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Lock className="h-5 w-5 text-primary-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-gray-300 text-sm">
                            Password must be at least 8 characters long and include uppercase, lowercase, and numbers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      leftIcon={<Lock size={16} />}
                      isLoading={changingPassword}
                    >
                      Change Password
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}