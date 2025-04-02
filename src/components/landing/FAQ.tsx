// src/components/landing/FAQ.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "Is this legal?",
    answer: "We comply with financial regulations while prioritizing user privacy. NoVerif operates within legal frameworks while offering privacy-focused services to our users.",
  },
  {
    question: "How do you ensure security?",
    answer: "We use bank-grade encryption and decentralized crypto protocols to ensure the highest level of security for all transactions and user data.",
  },
  {
    question: "Do I need to verify my identity?",
    answer: "No. NoVerif is designed to be verification-free. We only require basic information to set up your account.",
  },
  {
    question: "How long does it take to set up a virtual bank account?",
    answer: "Your virtual bank account will be ready within 48 hours after signing up.",
  },
  {
    question: "Which cryptocurrencies do you support?",
    answer: "We support all major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), and many others. You can connect multiple wallets to your NoVerif account.",
  },
  {
    question: "Are there any fees?",
    answer: "NoVerif charges minimal fees for transactions. Our fee structure is transparent and competitive compared to traditional payment processors.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold mb-4">
            <span className="gradient-text">Frequently Asked Questions</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Got questions? We've got answers. If you don't see what you're looking for, feel free to contact our support team.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <Card 
              key={index} 
              className="mb-4 last:mb-0 border-dark-700 hover:border-dark-600 transition-colors overflow-hidden"
            >
              <button 
                className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-medium text-white">{faq.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {openIndex === index && (
                <CardContent className="pt-0 pb-6 px-6">
                  <p className="text-gray-400">{faq.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;