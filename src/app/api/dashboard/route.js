// src/app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak' }, { status: 403 });
    }

    // 1. Total rooms and active rooms
    const totalRuangan = await prisma.ruangan.count();
    const totalRuanganAktif = await prisma.ruangan.count({
      where: { aktif: true }
    });

    // 2. Today's date calculations
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayDate = new Date(todayStr + 'T00:00:00.000Z');

    // 3. Bookings today
    const totalToday = await prisma.booking.count({
      where: { tanggal: todayDate }
    });

    const pendingToday = await prisma.booking.count({
      where: {
        tanggal: todayDate,
        status: 'Pending'
      }
    });

    const approvedToday = await prisma.booking.count({
      where: {
        tanggal: todayDate,
        status: 'Approved'
      }
    });

    const rejectedToday = await prisma.booking.count({
      where: {
        tanggal: todayDate,
        status: 'Rejected'
      }
    });

    // 4. Overall pending count
    const bookingPending = await prisma.booking.count({
      where: { status: 'Pending' }
    });

    return NextResponse.json({
      status: 'success',
      data: {
        totalRuangan,
        totalRuanganAktif,
        bookingHariIni: {
          total: totalToday,
          pending: pendingToday,
          approved: approvedToday,
          rejected: rejectedToday
        },
        bookingPending,
        tanggal: todayStr
      }
    });

  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
