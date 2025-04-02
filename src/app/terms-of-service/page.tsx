// src/app/terms-of-service/page.tsx
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-display font-bold mb-8">Terms of Service</h1>
            
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-invert max-w-none">
                  <p className="lead text-xl mb-6">
                    Welcome to NoVerif. By using our services, you agree to comply with and be bound by the following terms and conditions.
                  </p>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
                  <p>
                    By accessing or using NoVerif, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access or use our services.
                  </p>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Services</h2>
                  <p>
                    NoVerif provides payment processing services, virtual bank accounts, and cryptocurrency wallet integration to facilitate financial transactions. Our services allow users to send, receive, and manage payments with minimal verification requirements.
                  </p>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Registration</h2>
                  <p>
                    To use NoVerif, you must create an account by providing basic information. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                  </p>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Responsibilities</h2>
                  <p>
                    As a user of NoVerif, you are responsible for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Ensuring that your use of our services complies with all applicable laws</li>
                    <li>Using the service for legal purposes only</li>
                  </ul>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">5. Prohibited Activities</h2>
                  <p>
                    You agree not to use NoVerif for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Illegal activities, including money laundering or terrorist financing</li>
                    <li>Fraudulent transactions or scams</li>
                    <li>Transactions involving illegal goods or services</li>
                    <li>Attempts to bypass or circumvent our security measures</li>
                    <li>Unauthorized access to other users' accounts</li>
                  </ul>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">6. Fees and Charges</h2>
                  <p>
                    NoVerif charges fees for certain transactions and services. All fees are clearly disclosed before you complete a transaction. We reserve the right to change our fee structure with prior notice.
                  </p>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cryptocurrency Transactions</h2>
                  <p>
                    When using cryptocurrency features, you acknowledge:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Cryptocurrency values are volatile and subject to market fluctuations</li>
                    <li>We do not guarantee the value of any cryptocurrency</li>
                    <li>Transactions on blockchain networks are irreversible</li>
                    <li>You are responsible for the accuracy of wallet addresses</li>
                  </ul>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
                  <p>
                    NoVerif and its affiliates are not liable for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Indirect, incidental, special, consequential, or punitive damages</li>
                    <li>Loss of profits, data, or other intangibles</li>
                    <li>Damages resulting from unauthorized access to your account</li>
                    <li>Delays or failures in performance beyond our reasonable control</li>
                  </ul>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">9. Legal Compliance</h2>
                  <p>
                    Users are responsible for complying with all applicable laws and regulations in their jurisdiction. While NoVerif minimizes verification requirements, you must ensure your use of our services complies with local financial laws.
                  </p>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">10. Account Termination</h2>
                  <p>
                    We reserve the right to suspend or terminate your account at our discretion, particularly if we detect suspicious activity or violations of these terms. You may also terminate your account at any time by contacting our support team.
                  </p>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">11. Changes to Terms</h2>
                  <p>
                    We may modify these terms at any time. Continued use of NoVerif after changes constitutes acceptance of the modified terms. We will notify you of significant changes via email or through our platform.
                  </p>
                  
                  <h2 className="text-2xl font-semibold mt-8 mb-4">12. Governing Law</h2>
                  <p>
                    These terms are governed by and construed in accordance with applicable laws. Any disputes shall be resolved through arbitration in accordance with the rules of the American Arbitration Association.
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