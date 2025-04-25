// src/components/layout/DashboardHeader.tsx

import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/notifications/NotificationBell';
import Logo from '@/components/common/Logo';

const DashboardHeader: React.FC = () => {
  const { userData } = useAuth();

  return (
    <header className="bg-dark-900 border-b border-dark-800 h-16 fixed top-0 right-0 left-0 z-30 md:left-64">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <Logo withText={false} size="sm" />
        <h1 className="text-xl font-semibold text-white truncate">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <NotificationBell />
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white">
              <User size={16} />
            </div>
            <span className="ml-2 text-sm font-medium text-white max-w-[100px] truncate hidden sm:inline-block">
              {userData?.name || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;