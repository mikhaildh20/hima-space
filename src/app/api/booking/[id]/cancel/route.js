// src/app/api/booking/[id]/cancel/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// PATCH /api/booking/[id]/cancel - Cancel booking
export async function PATCH(request, { params }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    const { id: userId, role } = authResult.user;
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);

    if (isNaN(bookingId)) {
      return NextResponse.json({ status: 'error', message: 'ID tidak valid' }, { status: 422 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ status: 'error', message: 'Booking tidak ditemukan' }, { status: 404 });
    }

    // 1. Ownership check
    if (role === 'mahasiswa' && booking.userId !== userId) {
      return NextResponse.json({ status: 'error', message: 'Bukan booking kamu' }, { status: 403 });
    }

    // 2. Status transition check
    if (booking.status === 'Rejected') {
      return NextResponse.json({ status: 'error', message: 'Booking sudah ditolak, tidak bisa dibatalkan' }, { status: 422 });
    }

    if (booking.status === 'Cancelled') {
      return NextResponse.json({ status: 'error', message: 'Booking sudah dibatalkan sebelumnya' }, { status: 422 });
    }

    // 3. Update to Cancelled
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'Cancelled' }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Booking berhasil dibatalkan',
      data: {
        id: updated.id,
        status: updated.status
      }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
