import type { Metadata } from "next";
import { Alexandria } from "next/font/google";  // Import Alexandria
import "./globals.css";
import { AuthProvider } from '@/providers/AuthProvider'
import { Toaster } from 'react-hot-toast'

const alexandria = Alexandria({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-alexandria',
});

export const metadata: Metadata = {
  title: "BudgetFlow",
  description: "Budget Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${alexandria.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
