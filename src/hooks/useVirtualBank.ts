// src/hooks/useVirtualBank.ts
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { submitACHApplication } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';

// Helper function to safely convert to Date
function convertToDate(dateField: any): Date | null {
  if (!dateField) return null;
  
  // If it's already a Date
  if (dateField instanceof Date) {
    return dateField;
  }
  
  // If it's a Timestamp with toDate method
  if (typeof dateField === 'object' && 'toDate' in dateField && typeof dateField.toDate === 'function') {
    return dateField.toDate();
  }
  
  // If it's a number (timestamp in milliseconds)
  if (typeof dateField === 'number') {
    return new Date(dateField);
  }
  
  // If it's a string (date string)
  if (typeof dateField === 'string') {
    return new Date(dateField);
  }
  
  // Failed to convert
  return null;
}

export function useVirtualBank() {
  const { user, userData } = useAuth();
  const [status, setStatus] = useState<string>('pending');
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userData) {
      setStatus(userData.virtualBankStatus || 'pending');
      
      // Use the helper function to safely convert the date
      if (userData.virtualBankCreatedAt) {
        setCreatedAt(convertToDate(userData.virtualBankCreatedAt));
      } else {
        setCreatedAt(null);
      }
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