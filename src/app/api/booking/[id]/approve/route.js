// src/app/api/booking/[id]/approve/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// PATCH /api/booking/[id]/approve - Approve booking (Admin only)
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
        message: 'Hanya booking dengan status Pending yang bisa diapprove'
      }, { status: 422 });
    }

    // 3. Re-run conflict detection
    const conflict = await prisma.booking.findFirst({
      where: {
        id: { not: bookingId }, // exclude self
        ruanganId: booking.ruanganId,
        tanggal: booking.tanggal,
        status: 'Approved',
        jamMulai: { lt: booking.jamSelesai },    // existing.start < new.end
        jamSelesai: { gt: booking.jamMulai }      // existing.end > new.start
      },
      select: {
        id: true,
        judul: true,
        jamMulai: true,
        jamSelesai: true,
        status: true
      }
    });

    if (conflict) {
      return NextResponse.json({
        status: 'error',
        message: 'Tidak bisa approve karena bentrok dengan booking lain',
        data: {
          conflictWith: [conflict]
        }
      }, { status: 422 });
    }

    // 4. Update status to Approved
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'Approved' }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Booking berhasil diapprove',
      data: {
        id: updated.id,
        status: updated.status
      }
    });

  } catch (error) {
    console.error('Approve booking error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
