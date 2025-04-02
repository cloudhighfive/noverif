// src/app/privacy-policy/page.tsx
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-display font-bold mb-8">Privacy Policy</h1>
            
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-invert max-w-none">
                  <p className="lead text-xl mb-6">
                    At NoVerif, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                  </p>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
                  <p>
                    We collect minimal data to provide our services. This includes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Basic account information (name, email, phone)</li>
                    <li>Transaction data (amounts, timestamps, transaction types)</li>
                    <li>Crypto wallet addresses that you choose to connect</li>
                    <li>Information needed for virtual bank account setup</li>
                  </ul>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
                  <p>
                    We use the information we collect for the following purposes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To set up and maintain your account</li>
                    <li>To process and record transactions</li>
                    <li>To prevent fraud and ensure security</li>
                    <li>To communicate with you about your account</li>
                    <li>To fulfill our legal obligations</li>
                  </ul>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
                  <p>
                    We implement strict security measures to protect your data, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>End-to-end encryption for all transactions and communications</li>
                    <li>Secure storage protocols for personal information</li>
                    <li>Regular security audits and vulnerability testing</li>
                    <li>Staff training on data protection best practices</li>
                  </ul>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">Data Sharing</h2>
                  <p>
                    <strong>We never sell your data</strong>. We only share information with:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Banking partners to facilitate virtual account services</li>
                    <li>Payment processors to complete transactions</li>
                    <li>Legal authorities when required by law</li>
                  </ul>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
                  <p>
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and associated data</li>
                    <li>Restrict or object to certain processing activities</li>
                    <li>Export your data in a portable format</li>
                  </ul>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies and Tracking</h2>
                  <p>
                    We use essential cookies to ensure the functionality of our website. We do not use tracking cookies or third-party analytics that monitor your behavior across websites.
                  </p>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
                  <p>
                    We may update this policy from time to time. We will notify you of any significant changes via email or through our platform.
                  </p>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <p>
                    <a href="mailto:privacy@noverif.com" className="text-primary-500 hover:underline">privacy@noverif.com</a>
                  </p>
                  
                  <p className="text-sm text-gray-400 mt-8">
                    Last updated: March 20, 2025
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}