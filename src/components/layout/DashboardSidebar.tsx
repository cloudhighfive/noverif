// src/components/layout/DashboardSidebar.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, CreditCard, Wallet, FileText, Settings, 
  HelpCircle, LogOut, Menu, X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/common/Logo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresActive?: boolean;
}

const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout, isSuspended } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
      requiresActive: true
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
      requiresActive: true
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Mobile toggle button - Fixed position at bottom right
  const MobileToggle = () => (
    <button 
      className="md:hidden fixed bottom-4 right-4 z-50 bg-primary-500 text-white rounded-full p-3 shadow-lg"
      onClick={toggleSidebar}
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  return (
    <>
      <MobileToggle />
      
      {/* Overlay when sidebar is open on mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      <aside 
        className={`bg-dark-900 border-r border-dark-800 w-64 h-screen fixed left-0 top-0 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:pt-16`}
      >
        <div className="h-16 flex items-center px-4 border-b border-dark-800">
          <Logo size="md" />
        </div>
        <div className="p-4 h-full flex flex-col">
          <div className="md:hidden flex items-center justify-between mb-6 pt-4">
            <h1 className="text-xl font-display font-bold gradient-text">NoVerif</h1>
            <button onClick={() => setIsOpen(false)}>
              <X size={24} className="text-gray-400" />
            </button>
          </div>
          
          {isSuspended && (
            <div className="bg-red-500/20 text-red-500 p-3 mb-4 rounded-lg text-sm">
              Your account is currently suspended. You can view information but can't perform actions.
            </div>
          )}
          
          <nav className="space-y-1 flex-1 overflow-y-auto">
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
                    } else {
                      setIsOpen(false); // Close sidebar on navigation
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
    </>
  );
};

export default DashboardSidebar;