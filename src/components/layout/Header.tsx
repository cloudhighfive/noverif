"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-dark-900 border-b border-dark-800 sticky top-0 z-50">
      <div className="container py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-display font-bold gradient-text">NoVerif</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/#features" className="text-gray-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-gray-300 hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/#faq" className="text-gray-300 hover:text-white transition-colors">
            FAQ
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-900 border-t border-dark-800 py-4">
          <nav className="container flex flex-col space-y-4">
            <Link 
              href="/#features" 
              className="text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/#how-it-works" 
              className="text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="/#faq" 
              className="text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" fullWidth>
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  fullWidth
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="ghost" fullWidth>
                    Login
                  </Button>
                </Link>
                <Link 
                  href="/sign-up"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="primary" fullWidth>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;