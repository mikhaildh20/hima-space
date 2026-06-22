'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      if (pathname !== '/login') {
        router.push('/login');
      } else {
        setLoading(false);
      }
    } else {
      if (userData) {
        setUser(JSON.parse(userData));
      }
      if (pathname === '/login') {
        // Logged-in users go to calendar by default
        router.push('/kalender');
      } else {
        setLoading(false);
      }
    }
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  // Login page gets no wrapper shell
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top Header Navbar */}
      <Navbar user={user} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar user={user} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
