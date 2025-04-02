// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NoVerif - Payments Without Paperwork',
  description: 'Fast, secure, and anonymous payment processing with no KYC. Connect your crypto wallet and start transacting in minutes.',
  keywords: 'payment gateway, crypto wallet, virtual bank, no kyc, anonymous payments',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}