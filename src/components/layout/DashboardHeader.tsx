// src/components/layout/DashboardHeader.tsx

import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/notifications/NotificationBell';

const DashboardHeader: React.FC = () => {
  const { userData } = useAuth();

  return (
    <header className="bg-dark-900 border-b border-dark-800 h-16 fixed top-0 right-0 left-64 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <NotificationBell />
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white">
              <User size={16} />
            </div>
            <span className="ml-2 text-sm font-medium text-white">
              {userData?.name || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;