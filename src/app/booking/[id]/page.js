'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookingDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const bookingId = resolvedParams.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/booking/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Gagal memuat detail booking');
      }
      setBooking(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/booking/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Gagal membatalkan booking');
      }

      // Close modal and refresh data
      setShowCancelModal(false);
      fetchBooking();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center space-y-4 max-w-lg mx-auto">
        <p className="text-red-700 font-semibold">{error}</p>
        <Link
          href="/kalender"
          className="inline-block rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-semibold transition-colors"
        >
          Kembali ke Kalender
        </Link>
      </div>
    );
  }

  const isOwner = currentUser && booking && booking.userId === currentUser.id;
  const isAdmin = currentUser && currentUser.role === 'admin';
  const canCancel = booking && (booking.status === 'Pending' || booking.status === 'Approved') && (isOwner || isAdmin);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
        <Link href="/kalender" className="hover:text-blue-500">Jadwal</Link>
        <span>/</span>
        <span className="text-gray-900">Detail Booking</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
        {/* Header Title and Status */}
        <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gray-50">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{booking.judul}</h1>
            <p className="text-sm text-gray-500 mt-1">Diajukan pada {new Date(booking.createdAt).toLocaleString('id-ID')}</p>
          </div>
          <div>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
              booking.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-200' :
              booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              booking.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
              'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {booking.status}
            </span>
          </div>
        </div>

        {/* Content details */}
        <div className="p-6 space-y-6">
          {/* Reject Reason Banner */}
          {booking.status === 'Rejected' && booking.rejectReason && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
              <p className="font-bold">Alasan Penolakan Admin:</p>
              <p className="mt-1">{booking.rejectReason}</p>
            </div>
          )}

          {/* Time & Room */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Ruangan</span>
              <p className="text-base font-bold text-gray-950">{booking.ruangan.nama}</p>
              <p className="text-xs text-gray-500">Kapasitas: {booking.ruangan.kapasitas} orang</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Waktu</span>
              <p className="text-base font-bold text-gray-950">
                {new Date(booking.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-sm font-semibold text-gray-700">
                Jam {booking.jamMulai} - {booking.jamSelesai} WIB
              </p>
            </div>
          </div>

          {/* Pemesan */}
          <div className="space-y-1 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Pemesan</span>
            <p className="text-sm font-semibold text-gray-900">{booking.user.nama}</p>
            <p className="text-xs text-gray-500">{booking.user.email}</p>
          </div>

          {/* Deskripsi */}
          {booking.deskripsi && (
            <div className="space-y-1 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Deskripsi Kegiatan</span>
              <p className="text-sm text-gray-700 bg-gray-55/30 p-3 rounded-lg border border-gray-100 leading-relaxed">
                {booking.deskripsi}
              </p>
            </div>
          )}

          {/* Ruangan Fasilitas */}
          {booking.ruangan.fasilitas && booking.ruangan.fasilitas.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Fasilitas Ruangan</span>
              <div className="flex flex-wrap gap-2">
                {booking.ruangan.fasilitas.map((f, i) => (
                  <span key={i} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-gray-50 flex items-center justify-between">
          <Link
            href="/kalender"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Kembali
          </Link>

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="rounded-lg bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
              Batalkan Booking
            </button>
          )}
        </div>
      </div>

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
