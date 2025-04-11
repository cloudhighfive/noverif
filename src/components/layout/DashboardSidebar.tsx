// src/components/layout/DashboardSidebar.tsx

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, CreditCard, Wallet, FileText, Settings, 
  HelpCircle, LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresActive?: boolean; // Add this property to the interface
}

const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout, isSuspended } = useAuth();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Home size={20} />,
    },
    {
      label: 'ACH Application',
      href: '/dashboard/ach-application',
      icon: <CreditCard size={20} />,
      requiresActive: true // This action requires an active account
    },
    {
      label: 'Invoices',
      href: '/dashboard/invoices',
      icon: <FileText size={20} />,
    },
    {
      label: 'Crypto Wallet',
      href: '/dashboard/crypto-wallet',
      icon: <Wallet size={20} />,
      requiresActive: true // This action requires an active account
    },
    {
      label: 'Transactions',
      href: '/dashboard/transactions',
      icon: <FileText size={20} />,
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings size={20} />,
    },
    {
      label: 'Support',
      href: '/support',
      icon: <HelpCircle size={20} />,
    },
  ];

  return (
    <aside className="bg-dark-900 border-r border-dark-800 w-64 h-screen fixed left-0 top-0 z-40 pt-16">
      <div className="p-4 h-full flex flex-col">
        {isSuspended && (
          <div className="bg-red-500/20 text-red-500 p-3 mb-4 rounded-lg text-sm">
            Your account is currently suspended. You can view information but can't perform actions.
          </div>
        )}
        
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = isSuspended && item.requiresActive;
            
            return (
              <Link
                key={item.href}
                href={isDisabled ? '#' : item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                onClick={(e) => {
                  if (isDisabled) {
                    e.preventDefault();
                  }
                }}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
                {isDisabled && (
                  <span className="ml-auto text-xs text-red-500">Suspended</span>
                )}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => logout()}
          className="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-800 hover:text-white transition-colors mt-auto"
        >
          <LogOut size={20} className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;