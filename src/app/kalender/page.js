'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch rooms list
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

  // Fetch events for current month and selected room
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        let url = `/api/kalender?bulan=${month}&tahun=${year}`;
        if (selectedRoomId) {
          url += `&ruanganId=${selectedRoomId}`;
        }
        
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setEvents(data.data);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [currentDate, selectedRoomId]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon, ...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Shift Sunday (0) to index 6, Monday (1) to index 0...
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const calendarDays = [];
  // Padding from previous month
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false
    });
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true
    });
  }
  // Padding for next month to complete 42 cells (6 rows x 7 days)
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false
    });
  }

  // Get events of a specific day
  const getDayEvents = (day, m, y) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === m &&
        eventDate.getFullYear() === y
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jadwal Ruangan</h1>
          <p className="text-sm text-gray-500">Melihat ketersediaan dan membuat booking ruangan organisasi</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Room Filter Dropdown */}
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Semua Ruangan</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.nama}</option>
            ))}
          </select>
          {/* Create Booking Button */}
          <Link
            href="/booking/new"
            className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            + Booking Ruangan
          </Link>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Hari Ini
            </button>
            <button
              onClick={handlePrevMonth}
              className="rounded-md border border-gray-300 bg-white p-1.5 text-gray-700 hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-md border border-gray-300 bg-white p-1.5 text-gray-700 hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-100 text-center text-xs font-bold uppercase tracking-wider text-gray-600 py-3">
          <div>Sen</div>
          <div>Sel</div>
          <div>Rab</div>
          <div>Kam</div>
          <div>Jum</div>
          <div>Sab</div>
          <div className="text-red-500">Min</div>
        </div>

        {/* Grid cells */}
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-200 bg-gray-200">
            {calendarDays.map((cell, idx) => {
              const dayEvents = getDayEvents(cell.day, cell.month, cell.year);
              const formattedDate = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
              return (
                <div
                  key={idx}
                  className={`min-h-[110px] bg-white p-2 flex flex-col justify-between ${
                    cell.isCurrentMonth ? '' : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${!cell.isCurrentMonth ? 'text-gray-300' : ''}`}>
                      {cell.day}
                    </span>
                    {cell.isCurrentMonth && (
                      <Link
                        href={`/booking/new?date=${formattedDate}`}
                        className="text-[10px] text-blue-500 opacity-0 hover:opacity-100 hover:underline transition-opacity font-medium"
                      >
                        + Book
                      </Link>
                    )}
                  </div>
                  {/* Event pills stack */}
                  <div className="mt-2 space-y-1 flex-1 overflow-y-auto">
                    {dayEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event.extendedProps)}
                        className="w-full text-left truncate rounded px-1.5 py-1 text-[10px] font-semibold flex flex-col gap-0.5"
                        style={{
                          backgroundColor: event.backgroundColor + '22',
                          color: event.textColor === '#ffffff' ? event.borderColor : event.textColor,
                          borderLeft: `3px solid ${event.borderColor}`
                        }}
                      >
                        <span className="font-bold truncate">{event.title}</span>
                        <span className="opacity-85">{event.start.split('T')[1].substring(0, 5)} - {event.end.split('T')[1].substring(0, 5)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">Detail Booking</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                  selectedEvent.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedEvent.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Judul Kegiatan</p>
                <p className="text-base font-bold text-gray-900">{selectedEvent.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Ruangan</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedEvent.ruangan}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Pemesan</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedEvent.user}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Waktu Kegiatan</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedEvent.start?.split('T')[0]} │ {selectedEvent.start?.split('T')[1].substring(0, 5)} - {selectedEvent.end?.split('T')[1].substring(0, 5)}
                </p>
              </div>
              {selectedEvent.deskripsi && (
                <div>
                  <p className="text-xs text-gray-400 font-medium">Deskripsi</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 border border-gray-100">{selectedEvent.deskripsi}</p>
                </div>
              )}
            </div>
            <div className="border-top border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
