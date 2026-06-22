// src/app/api/ruangan/[id]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/ruangan/[id] - Detail Ruangan
export async function GET(request, { params }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    const resolvedParams = await params;
    const roomId = parseInt(resolvedParams.id);
    if (isNaN(roomId)) {
      return NextResponse.json({ status: 'error', message: 'ID tidak valid' }, { status: 422 });
    }

    const room = await prisma.ruangan.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return NextResponse.json({ status: 'error', message: 'Ruangan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      data: {
        ...room,
        fasilitas: JSON.parse(room.fasilitas || '[]')
      }
    });

  } catch (error) {
    console.error('Detail ruangan error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// PUT /api/ruangan/[id] - Edit Ruangan (Admin only)
export async function PUT(request, { params }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak' }, { status: 403 });
    }

    const resolvedParams = await params;
    const roomId = parseInt(resolvedParams.id);
    if (isNaN(roomId)) {
      return NextResponse.json({ status: 'error', message: 'ID tidak valid' }, { status: 422 });
    }

    const room = await prisma.ruangan.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return NextResponse.json({ status: 'error', message: 'Ruangan tidak ditemukan' }, { status: 404 });
    }

    const body = await request.json();
    const { nama, kapasitas, fasilitas, deskripsi, aktif } = body;

    const dataToUpdate = {};

    // Validate fields if provided
    if (nama !== undefined) {
      if (nama.trim().length < 1 || nama.trim().length > 100) {
        return NextResponse.json({ status: 'error', message: 'Nama harus 1-100 karakter' }, { status: 422 });
      }

      // Check duplicate name for other rooms
      const existing = await prisma.ruangan.findFirst({
        where: {
          nama: { equals: nama.trim(), mode: 'insensitive' },
          id: { not: roomId }
        }
      });

      if (existing) {
        return NextResponse.json({ status: 'error', message: 'Nama ruangan sudah ada' }, { status: 422 });
      }

      dataToUpdate.nama = nama.trim();
    }

    if (kapasitas !== undefined) {
      const parsedKapasitas = parseInt(kapasitas);
      if (isNaN(parsedKapasitas) || parsedKapasitas < 1) {
        return NextResponse.json({ status: 'error', message: 'Kapasitas minimal 1' }, { status: 422 });
      }
      dataToUpdate.kapasitas = parsedKapasitas;
    }

    if (fasilitas !== undefined) {
      dataToUpdate.fasilitas = JSON.stringify(fasilitas || []);
    }

    if (deskripsi !== undefined) {
      dataToUpdate.deskripsi = deskripsi?.trim() || null;
    }

    if (aktif !== undefined) {
      dataToUpdate.aktif = !!aktif;
    }

    const updatedRoom = await prisma.ruangan.update({
      where: { id: roomId },
      data: dataToUpdate
    });

    return NextResponse.json({
      status: 'success',
      data: {
        ...updatedRoom,
        fasilitas: JSON.parse(updatedRoom.fasilitas || '[]')
      }
    });

  } catch (error) {
    console.error('Update ruangan error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// DELETE /api/ruangan/[id] - Hapus / Nonaktifkan Ruangan (Admin only)
export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ status: 'error', message: authResult.error }, { status: 401 });
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak' }, { status: 403 });
    }

    const resolvedParams = await params;
    const roomId = parseInt(resolvedParams.id);
    if (isNaN(roomId)) {
      return NextResponse.json({ status: 'error', message: 'ID tidak valid' }, { status: 422 });
    }

    const room = await prisma.ruangan.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return NextResponse.json({ status: 'error', message: 'Ruangan tidak ditemukan' }, { status: 404 });
    }

    // Check if the room has bookings
    const bookingCount = await prisma.booking.count({
      where: { ruanganId: roomId }
    });

    if (bookingCount > 0) {
      // Toggle to inactive instead of permanent delete
      await prisma.ruangan.update({
        where: { id: roomId },
        data: { aktif: false }
      });

      return NextResponse.json({
        status: 'success',
        message: 'Ruangan memiliki histori booking, dinonaktifkan secara soft'
      });
    } else {
      // Permanent delete
      await prisma.ruangan.delete({
        where: { id: roomId }
      });

      return NextResponse.json({
        status: 'success',
        message: 'Ruangan berhasil dihapus secara permanen'
      });
    }

  } catch (error) {
    console.error('Delete ruangan error:', error);
    return NextResponse.json({ status: 'error', message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
