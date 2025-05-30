// src/components/landing/Features.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Lock, Zap, Wallet, CreditCard } from 'lucide-react';

const features = [
  {
    title: 'Zero Verification',
    description: 'No KYC requirements, no identity verification. Start transacting with complete privacy.',
    icon: <Lock className="h-8 w-8 md:h-10 md:w-10 text-primary-500" />,
  },
  {
    title: 'Instant Virtual Bank Setup',
    description: 'Get your virtual bank account set up within 48 hours. No paperwork, no waiting.',
    icon: <Zap className="h-8 w-8 md:h-10 md:w-10 text-primary-500" />,
  },
  {
    title: 'Crypto Wallet Integration',
    description: 'Seamlessly connect your crypto wallets (BTC, ETH, and more) for instant transactions.',
    icon: <Wallet className="h-8 w-8 md:h-10 md:w-10 text-primary-500" />,
  },
  {
    title: '1-Click ACH Processing',
    description: 'Process ACH payments with a single click. Fast, efficient, and secure transactions.',
    icon: <CreditCard className="h-8 w-8 md:h-10 md:w-10 text-primary-500" />,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 md:py-20 bg-dark-950">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold mb-4 text-2xl md:text-3xl lg:text-4xl">
            <span className="gradient-text">Cutting-Edge Features</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          NoVerif combines speed, security, and privacy to provide a seamless payment experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-primary-500/30 hover:border-primary-500/60 transition-colors h-full">
            <CardContent className="p-5 md:p-6 text-center">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm md:text-base">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);
};

export default Features;