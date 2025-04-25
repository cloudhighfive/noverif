// src/components/layout/Header.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/common/Logo';


const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-dark-900/95 backdrop-blur-sm shadow-md' : 'bg-dark-900'
    }`}>
      <div className="container py-4 px-4 mx-auto flex items-center justify-between">
        <Logo />
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
          className="md:hidden text-gray-300 hover:text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation - Slide down animation */}
      <div 
        className={`md:hidden bg-dark-900 border-t border-dark-800 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="container flex flex-col space-y-4 py-4 px-4">
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
    </header>
  );
};

export default Header;