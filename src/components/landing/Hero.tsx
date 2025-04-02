// src/components/landing/Hero.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display font-bold mb-6">
            <span className="gradient-text">Payments Without Paperwork.</span>
            <br />
            Fast, Secure, and Anonymous.
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            No KYC. No Delays. Connect your crypto wallet and start transacting in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                Get Started for Free
              </Button>
            </Link>
            <Link href="/#how-it-works">
              <Button variant="outline" size="lg">
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