"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { submitACHApplication } from '@/lib/firebase';

export function useVirtualBank() {
  const { user, userData } = useAuth();
  const [status, setStatus] = useState<string>('pending');
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userData) {
      setStatus(userData.virtualBankStatus || 'pending');
      setCreatedAt(userData.virtualBankCreatedAt ? userData.virtualBankCreatedAt.toDate() : null);
    }
  }, [userData]);

  const submitApplication = async (applicationData: any) => {
    if (!user) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      await submitACHApplication(user.uid, applicationData);
      setStatus('in_progress');
      setCreatedAt(new Date());
    } catch (error: any) {
      console.error("Error submitting application:", error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate progress percentage (0-100) based on status
  const getProgressPercentage = (): number => {
    switch (status) {
      case 'pending':
        return 0;
      case 'in_progress':
        return 50;
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  const getEstimatedCompletionDate = (): Date | null => {
    if (!createdAt) return null;
    
    const estimatedDate = new Date(createdAt);
    estimatedDate.setDate(estimatedDate.getDate() + 2); // Add 2 days
    return estimatedDate;
  };

  return {
    status,
    createdAt,
    submitting,
    error,
    submitApplication,
    getProgressPercentage,
    getEstimatedCompletionDate
  };
}