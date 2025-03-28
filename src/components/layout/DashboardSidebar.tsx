// src/components/layout/DashboardSidebar.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, CreditCard, Wallet, FileText, Settings, 
  HelpCircle, LogOut, Building 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const DashboardSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Home size={20} />,
    },
    {
      label: 'ACH Application',
      href: '/dashboard/ach-application',
      icon: <CreditCard size={20} />,
    },
    {
      label: 'Crypto Wallet',
      href: '/dashboard/crypto-wallet',
      icon: <Wallet size={20} />,
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
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
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