// src/components/landing/Hero.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display font-bold mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="gradient-text">Payments Without Paperwork.</span>
            <br className="hidden sm:block" />
            <span className="block sm:inline">Fast, Secure, and Anonymous.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            No KYC. No Delays. Connect your crypto wallet and start transacting in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" rightIcon={<ArrowRight size={18} />} fullWidth className="sm:w-auto">
                Get Started for Free
              </Button>
            </Link>
            <Link href="/#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" fullWidth className="sm:w-auto">
                Learn How It Works
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;