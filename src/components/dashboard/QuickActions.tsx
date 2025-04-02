// src/components/dashboard/QuickActions.tsx
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText } from 'lucide-react';
import { generateInvoice } from '@/lib/invoiceGenerator';

const QuickActions = () => {
  const handleGenerateInvoice = async () => {
    try {
      await generateInvoice();
      // Show success notification or redirect to invoice
    } catch (error) {
      console.error("Error generating invoice:", error);
      // Show error notification
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          variant="secondary"
          className="w-full justify-start"
          leftIcon={<FileText className="h-4 w-4" />}
          onClick={handleGenerateInvoice}
        >
          Generate Invoice
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;