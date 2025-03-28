import React from 'react';
import { CheckCircle } from 'lucide-react';

const steps = [
  {
    title: 'Sign up in 30 seconds',
    description: 'Create an account with minimal information. No documents required.',
  },
  {
    title: 'Get your virtual bank account',
    description: 'Your account will be ready in 48 hours. No verification calls or paperwork.',
  },
  {
    title: 'Connect crypto wallets',
    description: 'Link your preferred crypto wallets securely to your NoVerif account.',
  },
  {
    title: 'Start transacting',
    description: 'Send and receive payments instantly with complete privacy.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold mb-4">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Getting started with NoVerif is quick and easy. Follow these simple steps:
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start mb-12 last:mb-0">
              <div className="mr-4 mt-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white">
                  {index + 1}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="h-12 w-px bg-dark-700 ml-4 my-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;