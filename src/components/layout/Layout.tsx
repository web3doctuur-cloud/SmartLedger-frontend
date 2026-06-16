'use client';

import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

function InnerLayout({ children }: { children: React.ReactNode }) {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'toast-custom',
          style: {
            background: '#000000',
            color: '#FFFFFF',
            borderLeft: '4px solid #F59E0B',
          },
          error: {
            style: {
              background: '#000000',
              color: '#FFFFFF',
              borderLeft: '4px solid #EF4444',
            },
          },
          success: {
            style: {
              background: '#000000',
              color: '#FFFFFF',
              borderLeft: '4px solid #F59E0B',
            },
          },
        }}
      />
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <InnerLayout>{children}</InnerLayout>
    </AuthProvider>
  );
}