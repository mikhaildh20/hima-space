'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Pagination & Filter States
  const [statusFilter, setStatusFilter] = useState(''); // '' means All
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Modal Cancel State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      let url = `/api/booking?page=${page}&limit=${limit}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Gagal memuat histori booking');
      }

      setBookings(data.data);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalItems(data.pagination.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setPage(1); // reset to page 1 on filter change
  };

  const handleCancelClick = (id) => {
    setSelectedBookingId(id);
    setShowCancelModal(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingId) return;
    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/booking/${selectedBookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Gagal membatalkan booking');
      }

      setShowCancelModal(false);
      fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(false);
      setSelectedBookingId(null);
    }
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Histori Booking</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          {currentUser?.role === 'admin' 
            ? 'Daftar seluruh booking ruangan yang diajukan oleh mahasiswa'
            : 'Lacak dan kelola riwayat pemesanan ruangan Anda'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        {[
          { label: 'Semua', value: '' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Disetujui', value: 'Approved' },
          { label: 'Ditolak', value: 'Rejected' },
          { label: 'Dibatalkan', value: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer border ${
              statusFilter === tab.value
                ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking List Cards/Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-semibold">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="font-semibold text-gray-600">Tidak ada data booking ditemukan</p>
            {currentUser?.role !== 'admin' && (
              <Link
                href="/kalender"
                className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Booking Sekarang
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking) => {
              const canCancel = (booking.status === 'Pending' || booking.status === 'Approved');
              return (
                <div key={booking.id} className="p-6 hover:bg-gray-55/30 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        booking.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        booking.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {booking.status === 'Approved' ? 'Disetujui' :
                         booking.status === 'Pending' ? 'Pending' :
                         booking.status === 'Rejected' ? 'Ditolak' : 'Dibatalkan'}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">#{booking.id}</span>
                      {currentUser?.role === 'admin' && (
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          Oleh: {booking.user?.nama}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">{booking.judul}</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {booking.ruangan?.nama}
                      </span>
                      <span className="hidden sm:inline text-gray-300">|</span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(booking.tanggal)}
                      </span>
                      <span className="hidden sm:inline text-gray-300">|</span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {booking.jamMulai} - {booking.jamSelesai} WIB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <Link
                      href={`/booking/${booking.id}`}
                      className="text-xs font-bold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/55 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Detail
                    </Link>
                    {canCancel && (
                      <button
                        onClick={() => handleCancelClick(booking.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100/55 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Sebelumnya
          </button>
          <span className="text-sm font-medium text-gray-600">
            Halaman {page} dari {totalPages} (Total: {totalItems} item)
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Selanjutnya
          </button>
        </div>
      )}

      {/* Confirmation Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Batalkan Booking?</h3>
                <p className="text-sm text-gray-500 mt-1">Apakah Anda yakin ingin membatalkan pengajuan booking ruangan ini? Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setShowCancelModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="rounded-lg bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {cancelling && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
