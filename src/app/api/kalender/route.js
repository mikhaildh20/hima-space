// src/app/api/kalender/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const STATUS_COLORS = {
  Approved: { bg: '#22c55e', border: '#16a34a', text: '#ffffff' },
  Pending:  { bg: '#eab308', border: '#ca8a04', text: '#000000' }
};

export async function GET(request) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ruanganId = searchParams.get('ruanganId');
    
    const now = new Date();
    const bulan = parseInt(searchParams.get('bulan') || String(now.getMonth() + 1));
    const tahun = parseInt(searchParams.get('tahun') || String(now.getFullYear()));

    const startDate = new Date(Date.UTC(tahun, bulan - 1, 1));
    const endDate = new Date(Date.UTC(tahun, bulan, 0, 23, 59, 59));

    const where = {
      tanggal: {
        gte: startDate,
        lte: endDate
      },
      status: { in: ['Approved', 'Pending'] } // Only active bookings
    };

    if (ruanganId) {
      where.ruanganId = parseInt(ruanganId);
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        ruangan: { select: { id: true, nama: true } },
        user: { select: { id: true, nama: true } }
      },
      orderBy: [
        { tanggal: 'asc' },
        { jamMulai: 'asc' }
      ]
    });

    const events = bookings.map(booking => {
      const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.Pending;
      
      // format date as YYYY-MM-DD
      const dateStr = booking.tanggal.toISOString().split('T')[0];

      return {
        id: String(booking.id),
        title: booking.judul,
        start: `${dateStr}T${booking.jamMulai}:00`,
        end: `${dateStr}T${booking.jamSelesai}:00`,
        extendedProps: {
          bookingId: booking.id,
          ruangan: booking.ruangan.nama,
          ruanganId: booking.ruangan.id,
          user: booking.user.nama,
          userId: booking.user.id,
          status: booking.status,
          deskripsi: booking.deskripsi
        },
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text
      };
    });

    return NextResponse.json({
      status: 'success',
      data: events
    });

  } catch (error) {
    console.error('Calendar events fetch error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
