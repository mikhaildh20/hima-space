'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Form states
  const [nama, setNama] = useState('');
  const [kapasitas, setKapasitas] = useState(1);
  const [fasilitasStr, setFasilitasStr] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [aktif, setAktif] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      // Fetch all including inactive rooms
      const res = await fetch('/api/ruangan?all=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Gagal memuat daftar ruangan');
      }
      setRooms(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setNama('');
    setKapasitas(10);
    setFasilitasStr('AC, Proyektor, Whiteboard');
    setDeskripsi('');
    setError(null);
    setShowAddModal(true);
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setNama(room.nama);
    setKapasitas(room.kapasitas);
    setFasilitasStr(room.fasilitas.join(', '));
    setDeskripsi(room.deskripsi || '');
    setAktif(room.aktif);
    setError(null);
    setShowEditModal(true);
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const facilitiesArray = fasilitasStr
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ruangan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama,
          kapasitas: parseInt(kapasitas),
          fasilitas: facilitiesArray,
          deskripsi
        })
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Gagal menyimpan ruangan');
      }

      setShowAddModal(false);
      fetchRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRoom = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const facilitiesArray = fasilitasStr
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ruangan/${selectedRoom.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama,
          kapasitas: parseInt(kapasitas),
          fasilitas: facilitiesArray,
          deskripsi,
          aktif
        })
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Gagal memperbarui data ruangan');
      }

      setShowEditModal(false);
      fetchRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus/menonaktifkan ruangan ini?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ruangan/${roomId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Gagal memproses penghapusan');
      }

      alert(data.message || 'Operasi berhasil dilakukan');
      fetchRooms();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Ruangan</h1>
          <p className="text-sm text-gray-500 font-medium">CRUD data ruangan yang terdaftar di dalam sistem</p>
        </div>
        <div>
          <button
            onClick={openAddModal}
            className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-semibold transition-colors cursor-pointer shadow-sm"
          >
            + Tambah Ruangan
          </button>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-700">
              <thead className="bg-gray-50 font-semibold text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Nama Ruangan</th>
                  <th className="px-6 py-4">Kapasitas</th>
                  <th className="px-6 py-4">Fasilitas</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rooms.map((room, idx) => (
                  <tr key={room.id} className="hover:bg-gray-55/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{room.nama}</td>
                    <td className="px-6 py-4">{room.kapasitas} orang</td>
                    <td className="px-6 py-4 max-w-[200px] truncate">
                      <div className="flex flex-wrap gap-1">
                        {room.fasilitas.map((f, i) => (
                          <span key={i} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 font-medium">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        room.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {room.aktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(room)}
                        className="text-xs font-semibold text-blue-500 hover:text-blue-700 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">Belum ada data ruangan terdaftar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-55/30">
              <h3 className="text-md font-bold text-gray-900">Tambah Ruangan Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleAddRoom}>
              <div className="p-6 space-y-4">
                {error && <div className="text-xs text-red-600 bg-red-50 p-2 border border-red-200 rounded">{error}</div>}
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Ruangan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Aula Serbaguna"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kapasitas (Orang) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={kapasitas}
                    onChange={(e) => setKapasitas(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Fasilitas (Pisahkan dengan koma) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: AC, Proyektor, Whiteboard"
                    value={fasilitasStr}
                    onChange={(e) => setFasilitasStr(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Ruangan</label>
                  <textarea
                    rows="3"
                    placeholder="Tulis detail info ruangan..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 text-xs font-semibold disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {submitting && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
                  Simpan Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-55/30">
              <h3 className="text-md font-bold text-gray-900">Ubah Data Ruangan</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleEditRoom}>
              <div className="p-6 space-y-4">
                {error && <div className="text-xs text-red-600 bg-red-50 p-2 border border-red-200 rounded">{error}</div>}
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Ruangan *</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kapasitas (Orang) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={kapasitas}
                    onChange={(e) => setKapasitas(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Fasilitas (Pisahkan dengan koma) *</label>
                  <input
                    type="text"
                    required
                    value={fasilitasStr}
                    onChange={(e) => setFasilitasStr(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Ruangan</label>
                  <textarea
                    rows="3"
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="aktif-checkbox"
                    type="checkbox"
                    checked={aktif}
                    onChange={(e) => setAktif(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="aktif-checkbox" className="text-xs font-semibold text-gray-700">
                    Aktifkan Ruangan (Bisa dibooking)
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 text-xs font-semibold disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {submitting && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
