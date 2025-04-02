// src/components/dashboard/VirtualBankStatus.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Clock, ChevronRight, CheckCircle } from 'lucide-react';
import { useVirtualBank } from '@/hooks/useVirtualBank';
import { formatDate } from '@/utils/formatters';
import Link from 'next/link';

const VirtualBankStatus = () => {
  const { status, getProgressPercentage, getEstimatedCompletionDate } = useVirtualBank();
  
  const progressPercent = getProgressPercentage();
  const estimatedDate = getEstimatedCompletionDate();
  
  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Your virtual bank account creation is pending. Please complete the application form.';
      case 'in_progress':
        return 'Your application has been approved! Your virtual bank account is being created. This typically takes 1-2 days.';
      case 'rejected':
        return 'Unfortunately, your application was not approved. Please contact support for more information.';
      default:
        return 'Apply for your virtual bank account to get started.';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Virtual Bank Status</CardTitle>
        <CardDescription>Track the status of your virtual bank account application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressBar 
          value={progressPercent} 
          max={100} 
          label="Application Progress" 
          showValue 
          variant={status === 'rejected' ? 'error' : 'default'}
        />
        
        <div className="flex items-start mt-4">
          {status === 'rejected' ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-500 mr-2 mt-0.5 fill-current">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
            </svg>
          ) : status === 'in_progress' ? (
            <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          ) : (
            <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          )}
          <div>
            <p className={`${status === 'rejected' ? 'text-red-400' : 'text-gray-300'}`}>
              {getStatusText()}
            </p>
            {estimatedDate && status === 'in_progress' && (
              <p className="text-sm text-gray-400 mt-1">
                Estimated completion date: {formatDate(estimatedDate)}
              </p>
            )}
            {status === 'rejected' && (
              <p className="text-sm text-gray-400 mt-1">
                You may contact support for more information or to discuss reapplying.
              </p>
            )}
          </div>
        </div>
        
        {status === 'in_progress' && (
          <div className="bg-blue-900/20 border border-blue-900/30 rounded-md p-4 mt-2">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-400">Application Approved!</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Your application has been approved by our team. Your virtual bank account details will be available here once processing is complete.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {status === 'pending' ? (
          <Link href="/dashboard/ach-application" className="w-full">
            <Button fullWidth rightIcon={<ChevronRight size={16} />}>
              Complete Application
            </Button>
          </Link>
        ) : status === 'in_progress' ? (
          <Button variant="secondary" fullWidth disabled>
            Application In Progress
          </Button>
        ) : status === 'rejected' ? (
          <Link href="/support" className="w-full">
            <Button variant="secondary" fullWidth>
              Contact Support
            </Button>
          </Link>
        ) : (
          <Button variant="secondary" fullWidth>
            View Account Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default VirtualBankStatus;