// src/app/api/booking/pending/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/booking/pending - List all pending bookings (Admin only)
export async function GET(request) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak' }, { status: 403 });
    }

    const pendingBookings = await prisma.booking.findMany({
      where: { status: 'Pending' },
      include: {
        ruangan: {
          select: { id: true, nama: true, kapasitas: true }
        },
        user: {
          select: { id: true, nama: true, email: true }
        }
      },
      orderBy: [
        { tanggal: 'asc' },
        { jamMulai: 'asc' }
      ]
    });

    return NextResponse.json({
      status: 'success',
      data: pendingBookings
    });

  } catch (error) {
    console.error('List pending bookings error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
