'use client';

import { useRouter } from 'next/navigation';

export default function Navbar({ user }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-3">
        {/* App Logo */}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-md">
          H
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900">
          HIMA <span className="text-blue-500 font-medium">Space</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-gray-900">{user.nama}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
              {user.nama.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="rounded-md bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
