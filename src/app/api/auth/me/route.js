// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { status: 'error', message: authResult.error },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: user
    });

  } catch (error) {
    console.error('Verify token endpoint error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
