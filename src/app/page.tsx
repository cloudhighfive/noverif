import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        
        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />

          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display font-bold text-4xl mb-6">
                Ready to Start Your <span className="gradient-text">Payment Journey?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of users who trust NoVerif for fast, secure, and private transactions.
              </p>
              <Link href="/sign-up">
                <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}