// src/app/dashboard/ach-application/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useVirtualBank } from '@/hooks/useVirtualBank';
import { achApplicationSchema } from '@/utils/validators';

const purposeOptions = [
  { value: 'crypto_trading', label: 'Crypto Trading' },
  { value: 'freelancing', label: 'Freelancing' },
  { value: 'e_commerce', label: 'E-Commerce' },
  { value: 'business_payments', label: 'Business Payments' },
  { value: 'personal', label: 'Personal Use' },
  { value: 'other', label: 'Other' },
];

type ApplicationFormData = {
  businessName: string;
  purpose: string;
};

export default function ACHApplication() {
  const { isAuthenticated, loading } = useAuth();
  const { status, submitApplication, submitting } = useVirtualBank();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ApplicationFormData>({
    resolver: zodResolver(achApplicationSchema),
    defaultValues: {
      businessName: '',
      purpose: '',
    }
  });

  const purpose = watch('purpose');

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      await submitApplication(data);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-dark-950">
        <DashboardSidebar />
        <DashboardHeader />
        
        <main className="pt-24 pb-12 pl-64">
          <div className="container mx-auto px-6">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-white">
                      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Virtual Bank Account Active</h2>
                  <p className="text-gray-400 mb-6">
                    Your virtual bank account is already set up and ready to use.
                  </p>
                  <Button onClick={() => router.push('/dashboard')}>
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (status === 'in_progress') {
    return (
      <div className="min-h-screen bg-dark-950">
        <DashboardSidebar />
        <DashboardHeader />
        
        <main className="pt-24 pb-12 pl-64">
          <div className="container mx-auto px-6">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-yellow-500 rounded-full flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-white">
                      <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Application In Progress</h2>
                  <p className="text-gray-400 mb-6">
                    Your virtual bank account application is being processed. This typically takes 1-2 days.
                  </p>
                  <Button onClick={() => router.push('/dashboard')}>
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <DashboardSidebar />
      <DashboardHeader />
      
      <main className="pt-24 pb-12 pl-64">
        <div className="container mx-auto px-6">
          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold mb-2">ACH Application</h1>
            <p className="text-gray-400">
              Complete this form to set up your virtual bank account
            </p>
          </div>
          
          {isSuccess ? (
            <Card className="max-w-2xl">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-white">
                      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Application Submitted!</h2>
                  <p className="text-gray-400 mb-6">
                    Your virtual bank account will be ready in 1–2 days. No paperwork, no calls.
                  </p>
                  <p className="text-gray-400">
                    Redirecting you to the dashboard...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle>Virtual Bank Account Application</CardTitle>
                  <CardDescription>
                    Your virtual bank account will be ready in 1–2 days. No paperwork, no calls.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Input
                    id="businessName"
                    label="Business Name (optional)"
                    placeholder="Enter your business name if applicable"
                    error={errors.businessName?.message}
                    {...register('businessName')}
                  />
                  
                  <Dropdown
                    label="Purpose of Account"
                    options={purposeOptions}
                    value={purpose}
                    onChange={(value) => setValue('purpose', value)}
                    placeholder="Select a purpose for your account"
                    error={errors.purpose?.message}
                  />
                  
                  <div className="pt-4">
                    <div className="rounded-lg bg-dark-900 p-4 border border-dark-700">
                      <h3 className="text-sm font-medium text-white mb-2">
                        Important Information
                      </h3>
                      <p className="text-xs text-gray-400">
                        By submitting this application, you confirm that all provided information is accurate.
                        Your virtual bank account will be set up within 48 hours.
                        You'll receive a notification once your account is ready.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" fullWidth isLoading={submitting}>
                    Submit Application
                  </Button>
                </CardFooter>
              </Card>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}