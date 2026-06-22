'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      if (userObj.role !== 'admin') {
        router.push('/kalender');
      } else {
        setIsAdmin(true);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok || data.status === 'error') {
          throw new Error(data.message || 'Gagal memuat statistik dashboard');
        }
        setStats(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (!isAdmin || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="text-red-700 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Status operasional pemesanan ruangan dan inventaris HIMA Space hari ini
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/approval"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Antrean Approval
          </Link>
          <Link
            href="/admin/ruangan"
            className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Kelola Ruangan
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Rooms Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Ruangan</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{stats?.totalRuangan}</span>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
              {stats?.totalRuanganAktif} Aktif
            </span>
          </div>
        </div>

        {/* Pending Requests Count */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Butuh Approval</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{stats?.bookingPending}</span>
            {stats?.bookingPending > 0 && (
              <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded animate-pulse">
                Menunggu
              </span>
            )}
          </div>
        </div>

        {/* Today Bookings Total */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Booking Hari Ini</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{stats?.bookingHariIni?.total}</span>
            <span className="text-xs text-gray-500 font-medium">per {stats?.tanggal}</span>
          </div>
        </div>

        {/* Today Approval Rate */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Disetujui Hari Ini</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{stats?.bookingHariIni?.approved}</span>
            <span className="text-xs font-semibold text-gray-500">
              dari {stats?.bookingHariIni?.total} pengajuan
            </span>
          </div>
        </div>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">Rangkuman Booking Hari Ini</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-2xl font-bold text-yellow-800">{stats?.bookingHariIni?.pending}</p>
              <p className="text-xs font-semibold text-yellow-600 mt-1 uppercase">Pending</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-2xl font-bold text-green-800">{stats?.bookingHariIni?.approved}</p>
              <p className="text-xs font-semibold text-green-600 mt-1 uppercase">Approved</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-2xl font-bold text-red-800">{stats?.bookingHariIni?.rejected}</p>
              <p className="text-xs font-semibold text-red-600 mt-1 uppercase">Rejected</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500 font-medium">Ada request yang menunggu persetujuan Anda?</span>
            <Link href="/admin/approval" className="text-blue-500 font-bold hover:underline">
              Buka Antrean Approval &rarr;
            </Link>
          </div>
        </div>

        {/* Quick Guide */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Panduan Cepat Admin</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-2">
              <span className="h-5 w-5 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">1</span>
              <p>Periksa tab <strong>Kelola Ruangan</strong> untuk memperbarui data kapasitas dan fasilitas.</p>
            </div>
            <div className="flex gap-2">
              <span className="h-5 w-5 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">2</span>
              <p>Buka <strong>Approval Booking</strong> untuk memproses booking baru mahasiswa.</p>
            </div>
            <div className="flex gap-2">
              <span className="h-5 w-5 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">3</span>
              <p>Setiap penolakan booking wajib mencantumkan alasan yang jelas demi transparansi.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
