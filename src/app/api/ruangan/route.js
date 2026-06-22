// src/app/api/ruangan/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/ruangan - List all rooms
export async function GET(request) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const where = all ? {} : { aktif: true };

    const ruanganList = await prisma.ruangan.findMany({
      where,
      orderBy: { nama: 'asc' }
    });

    // Parse fasilitas JSON string to array
    const formattedList = ruanganList.map(r => ({
      ...r,
      fasilitas: JSON.parse(r.fasilitas || '[]')
    }));

    return NextResponse.json({
      status: 'success',
      data: formattedList
    });

  } catch (error) {
    console.error('List ruangan error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// POST /api/ruangan - Create new room (Admin only)
export async function POST(request) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();
    const { nama, kapasitas, fasilitas, deskripsi } = body;

    // Validation
    if (!nama || kapasitas === undefined) {
      return NextResponse.json({ status: 'error', message: 'Nama dan kapasitas wajib diisi' }, { status: 422 });
    }

    if (nama.trim().length < 1 || nama.trim().length > 100) {
      return NextResponse.json({ status: 'error', message: 'Nama harus 1-100 karakter' }, { status: 422 });
    }

    const parsedKapasitas = parseInt(kapasitas);
    if (isNaN(parsedKapasitas) || parsedKapasitas < 1) {
      return NextResponse.json({ status: 'error', message: 'Kapasitas minimal 1' }, { status: 422 });
    }

    // Check duplicate name
    const existing = await prisma.ruangan.findFirst({
      where: { nama: { equals: nama.trim(), mode: 'insensitive' } }
    });

    if (existing) {
      return NextResponse.json({ status: 'error', message: 'Nama ruangan sudah ada' }, { status: 422 });
    }

    // Save to database
    const newRoom = await prisma.ruangan.create({
      data: {
        nama: nama.trim(),
        kapasitas: parsedKapasitas,
        fasilitas: JSON.stringify(fasilitas || []),
        deskripsi: deskripsi?.trim() || null,
        aktif: true
      }
    });

    return NextResponse.json({
      status: 'success',
      data: {
        ...newRoom,
        fasilitas: JSON.parse(newRoom.fasilitas)
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create ruangan error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
