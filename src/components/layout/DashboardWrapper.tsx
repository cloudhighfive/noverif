// src/components/layout/DashboardWrapper.tsx
"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import SessionWarning from '@/components/common/SessionWarning';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ children }) => {
  const { sessionExpiring, timeRemaining, resetSession, logout } = useAuth();

  return (
    <div className="min-h-screen bg-dark-950">
      <DashboardSidebar />
      <DashboardHeader />
      
      <main className="pt-24 pb-20 md:pl-64 px-4 md:px-6">
        <div className="container mx-auto">
          {children}
        </div>
      </main>

      {/* Session timeout warning */}
      {sessionExpiring && (
        <SessionWarning
          timeRemaining={timeRemaining}
          onExtend={resetSession}
          onLogout={logout}
        />
      )}
    </div>
  );
};

export default DashboardWrapper;