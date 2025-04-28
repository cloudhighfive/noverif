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
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-16x16.png',
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* <link rel="manifest" href="/site.webmanifest" /> */}
      </head>
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}