// src/app/api/booking/[id]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/booking/[id] - Detail Booking
export async function GET(request, { params }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    const { id: userId, role } = authResult.user;
    const bookingId = parseInt(params.id);

    if (isNaN(bookingId)) {
      return NextResponse.json({ status: 'error', message: 'ID tidak valid' }, { status: 422 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ruangan: {
          select: { id: true, nama: true, kapasitas: true, fasilitas: true }
        },
        user: {
          select: { id: true, nama: true, email: true }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ status: 'error', message: 'Booking tidak ditemukan' }, { status: 404 });
    }

    // Role check: mahasiswa can only see their own booking
    if (role === 'mahasiswa' && booking.userId !== userId) {
      return NextResponse.json({ status: 'error', message: 'Bukan booking kamu' }, { status: 403 });
    }

    // Parse fasilitas JSON
    const formatted = {
      ...booking,
      ruangan: {
        ...booking.ruangan,
        fasilitas: JSON.parse(booking.ruangan.fasilitas || '[]')
      }
    };

    return NextResponse.json({
      status: 'success',
      data: formatted
    });

  } catch (error) {
    console.error('Detail booking error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
