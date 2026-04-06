import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/layout/Providers'; 
import { Toaster } from 'sonner'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HR | Leave Management System',
  description: 'Enterprise-grade leave and attendance tracking for modern teams.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        {/* This MUST wrap the children for Redux to work */}
        <Providers>
          {children}
        </Providers>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}