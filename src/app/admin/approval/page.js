'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminApprovalPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rejection modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [alasan, setAlasan] = useState('');
  const [processing, setProcessing] = useState(false);

  // Approval state
  const [approvingId, setApprovingId] = useState(null);

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

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/booking/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Gagal memuat antrean pending approval');
      }
      setBookings(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPending();
    }
  }, [isAdmin]);

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/booking/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Gagal menyetujui booking');
      }

      alert('Booking berhasil disetujui');
      fetchPending();
    } catch (err) {
      alert(err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const openRejectModal = (booking) => {
    setSelectedBooking(booking);
    setAlasan('');
    setShowRejectModal(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!alasan.trim()) {
      alert('Alasan penolakan wajib diisi');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/booking/${selectedBooking.id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ alasan: alasan.trim() })
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Gagal menolak booking');
      }

      setShowRejectModal(false);
      fetchPending();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
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

  if (!isAdmin || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Persetujuan Booking</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Daftar pengajuan pemesanan ruangan yang memerlukan verifikasi dan persetujuan Admin
        </p>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500 font-semibold">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="font-semibold text-gray-600">Semua pengajuan telah diproses!</p>
            <p className="text-xs text-gray-400">Tidak ada booking pending saat ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-55/30 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                      Pending
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">#{booking.id}</span>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded animate-pulse">
                      Oleh: {booking.user?.nama} ({booking.user?.email})
                    </span>
                  </div>
                  
                  <h2 className="text-lg font-bold text-gray-900">{booking.judul}</h2>
                  
                  {booking.deskripsi && (
                    <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded border border-gray-150 max-w-2xl">
                      &ldquo;{booking.deskripsi}&rdquo;
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Ruangan: {booking.ruangan?.nama}
                    </span>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Tanggal: {formatDate(booking.tanggal)}
                    </span>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Waktu: {booking.jamMulai} - {booking.jamSelesai} WIB
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:items-center gap-3 self-start sm:self-center">
                  <button
                    onClick={() => handleApprove(booking.id)}
                    disabled={approvingId === booking.id}
                    className="rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {approvingId === booking.id && (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(booking)}
                    className="rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-55/30">
              <h3 className="text-md font-bold text-gray-900">Tolak Booking</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleReject}>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-150 text-xs text-gray-600 space-y-1">
                  <p><strong>Judul Kegiatan:</strong> {selectedBooking?.judul}</p>
                  <p><strong>Ruangan:</strong> {selectedBooking?.ruangan?.nama}</p>
                  <p><strong>Waktu:</strong> {selectedBooking && formatDate(selectedBooking.tanggal)} (Jam {selectedBooking?.jamMulai} - {selectedBooking?.jamSelesai} WIB)</p>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Alasan Penolakan *</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Contoh: Ruangan akan digunakan untuk pemeliharaan rutin..."
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="rounded-lg bg-red-500 hover:bg-red-600 text-white px-5 py-2 text-xs font-semibold disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {processing && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
                  Tolak Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
