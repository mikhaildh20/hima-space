// src/app/api/booking/[id]/reject/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// PATCH /api/booking/[id]/reject - Reject booking (Admin only)
export async function PATCH(request, { params }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak' }, { status: 403 });
    }

    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    if (isNaN(bookingId)) {
      return NextResponse.json({ status: 'error', message: 'ID tidak valid' }, { status: 422 });
    }

    // 1. Find booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ status: 'error', message: 'Booking tidak ditemukan' }, { status: 404 });
    }

    // 2. Validate current status is Pending
    if (booking.status !== 'Pending') {
      return NextResponse.json({
        status: 'error',
        message: 'Hanya booking dengan status Pending yang bisa direject'
      }, { status: 422 });
    }

    // 3. Extract reject reason from body
    const body = await request.json().catch(() => ({}));
    const { alasan } = body;

    // 4. Update status to Rejected
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'Rejected',
        rejectReason: alasan?.trim() || null
      }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Booking berhasil direject',
      data: {
        id: updated.id,
        status: updated.status,
        rejectReason: updated.rejectReason
      }
    });

  } catch (error) {
    console.error('Reject booking error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
