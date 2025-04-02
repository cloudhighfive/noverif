// src/components/admin/ACHApprovalForm.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, addNotification } from '@/lib/firebase';
import { ACHBankDetails } from '@/types';

const bankDetailsSchema = z.object({
  bankName: z.string().min(1, { message: 'Bank name is required' }),
  bankAddress: z.string().min(1, { message: 'Bank address is required' }),
  accountOwner: z.string().min(1, { message: 'Account owner name is required' }),
  accountType: z.string().min(1, { message: 'Account type is required' }),
  accountNumber: z.string().min(5, { message: 'Valid account number is required' }),
  routingNumber: z.string().length(9, { message: 'Routing number must be 9 digits' }),
  swiftCode: z.string().optional(),
  adminNotes: z.string().optional()
});

type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

const accountTypeOptions = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' }
];

interface ACHApprovalFormProps {
  applicationId: string;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialStatus: 'pending' | 'in_progress';
  initialData?: ACHBankDetails;
}

const ACHApprovalForm: React.FC<ACHApprovalFormProps> = ({ 
  applicationId, 
  userId, 
  onSuccess, 
  onCancel,
  initialStatus,
  initialData
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BankDetailsFormData>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: initialData || {
      bankName: '',
      bankAddress: '',
      accountOwner: '',
      accountType: 'checking',
      accountNumber: '',
      routingNumber: '',
      swiftCode: '',
      adminNotes: ''
    }
  });
  
  const accountType = watch('accountType');
  
  // When a new account type is selected from the dropdown
  const handleAccountTypeChange = (value: string): void => {
    setValue('accountType', value);
  };
  
  const handleApprove = async (data: BankDetailsFormData): Promise<void> => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Determine if we're moving to 'in_progress' or 'completed' state
      const newStatus = initialStatus === 'pending' ? 'in_progress' : 'completed';
      const timestamp = new Date();
      
      // Update application with bank details and status
      await updateDoc(doc(db, 'achApplications', applicationId), {
        status: newStatus,
        bankDetails: {
          bankName: data.bankName,
          bankAddress: data.bankAddress,
          accountOwner: data.accountOwner,
          accountType: data.accountType,
          accountNumber: data.accountNumber,
          routingNumber: data.routingNumber,
          swiftCode: data.swiftCode || null,
        },
        adminNotes: data.adminNotes || null,
        updatedAt: timestamp,
        ...(newStatus === 'in_progress' ? { approvedAt: timestamp } : { completedAt: timestamp })
      });
      
      // Update user's status and bank details if completing the application
      if (newStatus === 'completed') {
        // First get user data to ensure we have the latest
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          await updateDoc(doc(db, 'users', userId), {
            virtualBankStatus: 'completed',
            virtualBankCompletedAt: timestamp,
            bankDetails: {
              bankName: data.bankName,
              bankAddress: data.bankAddress,
              accountOwner: data.accountOwner,
              accountType: data.accountType,
              accountNumber: data.accountNumber,
              routingNumber: data.routingNumber,
              swiftCode: data.swiftCode || null,
            }
          });
        }
      } else {
        // Just update the status for 'in_progress'
        await updateDoc(doc(db, 'users', userId), {
          virtualBankStatus: 'in_progress',
          updatedAt: timestamp
        });
      }
      
      // Add notification for the user
      await addNotification({
        userId: userId,
        type: 'ach',
        message: `Your ACH application status has been updated to: ${newStatus}`,
        relatedId: applicationId
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error updating application:", error);
      setError("Failed to update application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialStatus === 'pending' ? 'Approve Application' : 'Complete Application'}
        </CardTitle>
        <CardDescription>
          {initialStatus === 'pending' 
            ? 'Enter virtual bank details to approve this application'
            : 'Finalize bank details to complete this application'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(handleApprove)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="bankName"
              label="Bank Name"
              placeholder="Enter bank name"
              error={errors.bankName?.message}
              {...register('bankName')}
            />
            
            <Dropdown
              label="Account Type"
              options={accountTypeOptions}
              value={accountType}
              onChange={handleAccountTypeChange}
              placeholder="Select account type"
              error={errors.accountType?.message}
            />
          </div>
          
          <Input
            id="bankAddress"
            label="Bank Address"
            placeholder="Enter bank address"
            error={errors.bankAddress?.message}
            {...register('bankAddress')}
          />
          
          <Input
            id="accountOwner"
            label="Account Owner"
            placeholder="Enter account owner's name"
            error={errors.accountOwner?.message}
            {...register('accountOwner')}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="accountNumber"
              label="Account Number"
              placeholder="Enter account number"
              error={errors.accountNumber?.message}
              {...register('accountNumber')}
            />
            
            <Input
              id="routingNumber"
              label="Routing Number (ABA)"
              placeholder="Enter 9-digit routing number"
              error={errors.routingNumber?.message}
              {...register('routingNumber')}
            />
          </div>
          
          <Input
            id="swiftCode"
            label="SWIFT Code (Optional)"
            placeholder="For international transfers"
            error={errors.swiftCode?.message}
            {...register('swiftCode')}
          />
          
          <div>
            <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-200 mb-2">
              Admin Notes (Internal Only)
            </label>
            <textarea
              id="adminNotes"
              rows={3}
              placeholder="Add any notes about this application (not visible to user)"
              className="block w-full rounded-lg border-dark-700 bg-dark-800 text-white placeholder-dark-400 focus:border-primary-500 focus:ring-primary-500"
              {...register('adminNotes')}
            ></textarea>
          </div>
          
          {error && (
            <div className="bg-red-900/20 border border-red-900/30 rounded-md p-3">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button 
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            isLoading={submitting}
          >
            {initialStatus === 'pending' ? 'Approve Application' : 'Complete Application'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ACHApprovalForm;