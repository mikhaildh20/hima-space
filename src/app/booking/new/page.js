'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date') || '';

  const [rooms, setRooms] = useState([]);
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [ruanganId, setRuanganId] = useState('');
  const [tanggal, setTanggal] = useState(dateParam);
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conflictDetails, setConflictDetails] = useState(null);

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/ruangan', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setRooms(data.data);
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
      }
    };
    fetchRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setConflictDetails(null);

    // Basic client validation
    if (!judul || !ruanganId || !tanggal || !jamMulai || !jamSelesai) {
      setError('Semua field wajib diisi');
      setLoading(false);
      return;
    }

    if (jamSelesai <= jamMulai) {
      setError('Jam selesai harus lebih besar dari jam mulai');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          judul,
          deskripsi,
          ruanganId: parseInt(ruanganId),
          tanggal,
          jamMulai,
          jamSelesai
        })
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        if (data.data && data.data.conflictWith) {
          setConflictDetails(data.data.conflictWith[0]);
        }
        throw new Error(data.message || 'Gagal menyimpan booking');
      }

      // Success redirect
      router.push('/kalender');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Form Booking Ruangan</h1>
        <p className="text-sm text-gray-500 mb-6">Isi formulir untuk mengajukan booking ruangan mahasiswa</p>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 space-y-2 mb-6">
            <div className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{error}</span>
            </div>
            {conflictDetails && (
              <div className="pl-7 text-xs text-red-600 bg-white border border-red-100 rounded p-2 mt-2">
                <p className="font-bold">Detail Jadwal Bentrok:</p>
                <p>Kegiatan: <span className="font-semibold">{conflictDetails.judul}</span></p>
                <p>Waktu: <span className="font-semibold">{conflictDetails.jamMulai} - {conflictDetails.jamSelesai}</span></p>
                <p>Status: <span className="font-bold text-green-600">Disetujui</span></p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Kegiatan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Rapat Pengurus Harian HIMA"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Ruangan *</label>
            <select
              required
              value={ruanganId}
              onChange={(e) => setRuanganId(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="">Pilih Ruangan</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.nama} (Kapasitas: {room.kapasitas})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Booking *</label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jam Mulai *</label>
              <input
                type="time"
                required
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jam Selesai *</label>
              <input
                type="time"
                required
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Kegiatan (Opsional)</label>
            <textarea
              rows={3}
              placeholder="Tambahkan detail kegiatan seperti agenda atau perlengkapan yang dibutuhkan..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              href="/kalender"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
              Booking Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
