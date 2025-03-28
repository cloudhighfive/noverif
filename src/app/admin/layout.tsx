"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, CreditCard, Wallet, FileText, BarChart, 
  Settings, HelpCircle, LogOut, Menu, X, Home 
} from 'lucide-react';
import { adminCheckAuth, adminSignOut } from '@/lib/adminAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await adminCheckAuth();
        if (!isAuthenticated && !pathname?.includes('/admin/login') && !pathname?.includes('/admin/register')) {
          router.push('/admin/login');
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push('/admin/login');
        return;
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [pathname, router]);
  
  const handleSignOut = async () => {
    try {
      await adminSignOut();
      router.push('/admin/login');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  
  // Skip the layout for login and register pages
  if (pathname === '/admin/login' || pathname === '/admin/register') {
    return <>{children}</>;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: <Home size={20} />,
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: <Users size={20} />,
    },
    {
      label: 'ACH Applications',
      href: '/admin/ach-applications',
      icon: <CreditCard size={20} />,
    },
    {
      label: 'Wallets',
      href: '/admin/wallets',
      icon: <Wallet size={20} />,
    },
    {
      label: 'Transactions',
      href: '/admin/transactions',
      icon: <FileText size={20} />,
    },
    {
      label: 'Reports',
      href: '/admin/reports',
      icon: <BarChart size={20} />,
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: <Settings size={20} />,
    }
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile Header */}
      <header className="bg-dark-900 border-b border-dark-800 h-16 fixed top-0 left-0 right-0 z-40 md:hidden">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-gray-400 hover:text-white"
            >
              {showSidebar ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-display font-bold gradient-text ml-4">
              SwiftPay Admin
            </h1>
          </div>
        </div>
      </header>
      
      {/* Sidebar */}
      <aside 
        className={`bg-dark-900 border-r border-dark-800 w-64 h-screen fixed left-0 top-0 z-30 transition-transform duration-300 transform ${
          showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="h-12 flex items-center">
            <h1 className="text-xl font-display font-bold gradient-text">
              SwiftPay Admin
            </h1>
          </div>
          
          <nav className="mt-8 space-y-1 flex-1">
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
                  onClick={() => setShowSidebar(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <button
            onClick={handleSignOut}
            className="flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-800 hover:text-white transition-colors mt-auto"
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="pt-6 pb-12 md:pl-64 md:pt-6 md:pr-6">
        <div className="container mx-auto px-4 md:px-6 mt-16 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}