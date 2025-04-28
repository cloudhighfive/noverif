// src/app/admin/login/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminSignIn, adminCheckAuth } from '@/lib/adminAuth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await adminCheckAuth();
        if (isAuthenticated) {
          router.push('/admin/dashboard');
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [router]);
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await adminSignIn(data.email, data.password);
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      
      // User-friendly error messages based on Firebase error codes
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please try again.");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later.");
      } else if (error.code === 'auth/user-disabled') {
        setError("This account has been disabled. Please contact an administrator.");
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Access the NoVerif admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="Enter your admin email"
              error={errors.email?.message}
              {...register('email')}
            />
            
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />
            
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}
            
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Log In
            </Button>
            
            {/* Register link removed */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}