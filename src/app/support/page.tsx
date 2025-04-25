// src/app/support/page.tsx
'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { Mail, MessageSquare, FileText, Check, AlertCircle } from 'lucide-react';

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const faqItems = [
  {
    question: "How long does it take to set up a virtual bank account?",
    answer: "Virtual bank accounts are typically set up within 48 hours after submitting your application. You'll receive a notification once your account is ready to use."
  },
  {
    question: "Which cryptocurrencies are supported?",
    answer: "We support all major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), and many others. You can connect multiple crypto wallets to your NoVerif account."
  },
  {
    question: "Is there a limit on transaction amounts?",
    answer: "Initial account limits are set at $10,000 per transaction and $50,000 per month. Higher limits are available upon request for established accounts."
  },
  {
    question: "How are my crypto assets secured?",
    answer: "Your crypto assets remain in your wallets. NoVerif never takes custody of your cryptocurrency - we simply facilitate transactions through secure APIs."
  },
  {
    question: "What fees does NoVerif charge?",
    answer: "We charge 1% for crypto transactions and a flat $0.30 fee for ACH transfers. There are no monthly fees or hidden charges."
  }
];

export default function Support() {
  const [activeTab, setActiveTab] = useState<'contact' | 'faq'>('contact');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    try {
      setFormError(null);
      
      // Send the email via our API route
      const response = await fetch('/api/send-support-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }
      
      setFormSubmitted(true);
      reset();
      
      // Reset form submitted state after 5 seconds
      setTimeout(() => setFormSubmitted(false), 5000);
    } catch (error) {
      console.error('Error sending support message:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-display font-bold mb-2">Support Center</h1>
            <p className="text-xl text-gray-400 mb-8">
              Get help with your NoVerif account and services
            </p>
            
            <div className="mb-8">
              <div className="flex border-b border-dark-700">
                <button
                  className={`py-3 px-6 font-medium text-sm ${
                    activeTab === 'contact'
                      ? 'text-primary-500 border-b-2 border-primary-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('contact')}
                >
                  Contact Us
                </button>
                <button
                  className={`py-3 px-6 font-medium text-sm ${
                    activeTab === 'faq'
                      ? 'text-primary-500 border-b-2 border-primary-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('faq')}
                >
                  FAQ
                </button>
              </div>
            </div>
            
            {activeTab === 'contact' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Mail className="h-8 w-8 text-primary-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Email Support</h3>
                      <p className="text-gray-400 mb-4">
                        Send us an email and we'll respond within 24 hours
                      </p>
                      <a 
                        href="mailto:support@noverif.com" 
                        className="text-primary-500 hover:underline font-medium"
                      >
                        support@noverif.com
                      </a>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="h-8 w-8 text-primary-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Live Chat</h3>
                      <p className="text-gray-400 mb-4">
                        Chat with our support team during business hours
                      </p>
                      <Button variant="outline" size="sm">
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* <Card>
                    <CardContent className="p-6 text-center">
                      <Phone className="h-8 w-8 text-primary-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Phone Support</h3>
                      <p className="text-gray-400 mb-4">
                        Call us Monday to Friday, 9AM - 5PM EST
                      </p>
                      <a 
                        href="tel:+18005551234" 
                        className="text-primary-500 hover:underline font-medium"
                      >
                        +1 (800) 555-1234
                      </a>
                    </CardContent>
                  </Card> */}
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Form</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you shortly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {formSubmitted ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
                          <Check className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Message Sent!</h3>
                        <p className="text-gray-400">
                          Thank you for contacting us. We'll respond to your inquiry as soon as possible.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            id="name"
                            label="Your Name"
                            placeholder="Enter your full name"
                            error={errors.name?.message}
                            {...register('name', { required: 'Name is required' })}
                          />
                          
                          <Input
                            id="email"
                            type="email"
                            label="Email Address"
                            placeholder="Enter your email address"
                            error={errors.email?.message}
                            {...register('email', { 
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                              }
                            })}
                          />
                        </div>
                        
                        <Input
                          id="subject"
                          label="Subject"
                          placeholder="Enter the subject of your message"
                          error={errors.subject?.message}
                          {...register('subject', { required: 'Subject is required' })}
                        />
                        
                        <div className="space-y-2">
                          <label htmlFor="message" className="block text-sm font-medium text-gray-200">
                            Message
                          </label>
                          <textarea
                            id="message"
                            rows={5}
                            placeholder="Enter your message here"
                            className={`block w-full rounded-lg border-dark-700 bg-dark-800 text-white placeholder-dark-400 focus:border-primary-500 focus:ring-primary-500 ${
                              errors.message ? 'border-red-500' : ''
                            }`}
                            {...register('message', { required: 'Message is required' })}
                          />
                          {errors.message && (
                            <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
                          )}
                        </div>
                        
                        {/* Display form error if any */}
                        {formError && (
                          <div className="p-3 rounded-md bg-red-900/20 border border-red-500/30 flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                            <p className="text-sm text-red-500">{formError}</p>
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <Button type="submit" fullWidth isLoading={isSubmitting}>
                            Send Message
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Find quick answers to common questions about NoVerif
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqItems.map((item, index) => (
                      <div 
                        key={index} 
                        className="border border-dark-700 rounded-lg overflow-hidden"
                      >
                        <button
                          className="w-full text-left p-4 flex justify-between items-center bg-dark-800 hover:bg-dark-700 transition-colors"
                          onClick={() => toggleFaq(index)}
                        >
                          <h3 className="text-white font-medium">{item.question}</h3>
                          <span className="ml-4">
                            {expandedFaq === index ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                        </button>
                        {expandedFaq === index && (
                          <div className="p-4 bg-dark-900">
                            <p className="text-gray-400">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-4 rounded-lg bg-dark-800 border border-dark-700">
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-white mb-1">
                          Need more help?
                        </h3>
                        <p className="text-xs text-gray-400">
                          Check out our comprehensive <a href="/documentation" className="text-primary-500 hover:underline">documentation</a> for detailed guides on using NoVerif, or <a href="/support#contact" className="text-primary-500 hover:underline" onClick={() => setActiveTab('contact')}>contact our support team</a> for personalized assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}