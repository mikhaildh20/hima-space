// src/app/api/booking/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { validateTime, isTimeAfter, isDateNotPast } from '@/lib/validation';

// GET /api/booking - List bookings (own for students, all for admin)
export async function GET(request) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    const { id: userId, role } = authResult.user;
    const { searchParams } = new URL(request.url);

    const statusFilter = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = {};

    // Enforce student ownership filter
    if (role === 'mahasiswa') {
      where.userId = userId;
    } else {
      // Admin can filter by userId if provided
      const filterUserId = searchParams.get('userId');
      if (filterUserId) {
        where.userId = parseInt(filterUserId);
      }
    }

    // Filter by status if provided (case-sensitive matching StatusBooking: Pending, Approved, Rejected, Cancelled)
    if (statusFilter) {
      // Capitalize first letter of status
      const capitalized = statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).toLowerCase();
      if (['Pending', 'Approved', 'Rejected', 'Cancelled'].includes(capitalized)) {
        where.status = capitalized;
      }
    }

    const total = await prisma.booking.count({ where });
    
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        ruangan: {
          select: { id: true, nama: true, kapasitas: true }
        },
        user: {
          select: { id: true, nama: true, email: true }
        }
      },
      orderBy: [
        { tanggal: 'desc' },
        { jamMulai: 'desc' }
      ],
      skip,
      take: limit
    });

    return NextResponse.json({
      status: 'success',
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('List booking error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// POST /api/booking - Create new booking
export async function POST(request) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    const userId = authResult.user.id;
    const body = await request.json();
    const { judul, deskripsi, ruanganId, tanggal, jamMulai, jamSelesai } = body;

    // 1. Basic validation
    if (!judul || !ruanganId || !tanggal || !jamMulai || !jamSelesai) {
      return NextResponse.json({ status: 'error', message: 'Semua field wajib diisi' }, { status: 422 });
    }

    if (judul.trim().length < 3 || judul.trim().length > 200) {
      return NextResponse.json({ status: 'error', message: 'Judul harus 3-200 karakter' }, { status: 422 });
    }

    // 2. Validate room
    const room = await prisma.ruangan.findUnique({
      where: { id: Number(ruanganId) }
    });

    if (!room || !room.aktif) {
      return NextResponse.json({ status: 'error', message: 'Ruangan tidak ditemukan atau tidak aktif' }, { status: 422 });
    }

    // 3. Validate date not in past
    if (!isDateNotPast(tanggal)) {
      return NextResponse.json({ status: 'error', message: 'Tidak bisa booking hari kemarin' }, { status: 422 });
    }

    // 4. Validate time format
    if (!validateTime(jamMulai) || !validateTime(jamSelesai)) {
      return NextResponse.json({ status: 'error', message: 'Format jam tidak valid (HH:mm)' }, { status: 422 });
    }

    // 5. Validate jamSelesai > jamMulai
    if (!isTimeAfter(jamSelesai, jamMulai)) {
      return NextResponse.json({ status: 'error', message: 'Jam selesai harus lebih besar dari jam mulai' }, { status: 422 });
    }

    const bookingDate = new Date(tanggal + 'T00:00:00.000Z');

    // 6. Conflict detection
    // FSD: check against overlapping "Approved" status bookings for the same room and date.
    const conflict = await prisma.booking.findFirst({
      where: {
        ruanganId: Number(ruanganId),
        tanggal: bookingDate,
        status: 'Approved',
        jamMulai: { lt: jamSelesai },    // existing.start < new.end
        jamSelesai: { gt: jamMulai }      // existing.end > new.start
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
        message: 'Ruangan sudah dibooking pada waktu tersebut',
        data: {
          conflictWith: [conflict]
        }
      }, { status: 422 });
    }

    // 7. Create pending booking
    const booking = await prisma.booking.create({
      data: {
        judul: judul.trim(),
        deskripsi: deskripsi?.trim() || null,
        ruanganId: Number(ruanganId),
        userId: userId,
        tanggal: bookingDate,
        jamMulai,
        jamSelesai,
        status: 'Pending'
      },
      include: {
        ruangan: {
          select: { id: true, nama: true }
        }
      }
    });

    return NextResponse.json({
      status: 'success',
      data: booking
    }, { status: 201 });

  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
