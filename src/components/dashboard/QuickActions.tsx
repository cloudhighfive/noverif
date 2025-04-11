// src/components/dashboard/QuickActions.tsx
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, CreditCard, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const QuickActions = () => {
  const router = useRouter();
  const { isSuspended } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="secondary"
          className="w-full justify-start"
          leftIcon={<PlusCircle className="h-4 w-4" />}
          onClick={() => router.push('/dashboard/invoices/create')}
          disabled={isSuspended}
        >
          Create Invoice
        </Button>
        
        <Button
          variant="secondary"
          className="w-full justify-start"
          leftIcon={<FileText className="h-4 w-4" />}
          onClick={() => router.push('/dashboard/invoices')}
        >
          View Invoices
        </Button>
        
        <Button
          variant="secondary"
          className="w-full justify-start"
          leftIcon={<CreditCard className="h-4 w-4" />}
          onClick={() => router.push('/dashboard/ach-application')}
          disabled={isSuspended}
        >
          ACH Application
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;