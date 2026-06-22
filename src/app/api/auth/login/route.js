// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Validate input
    if (!email || !password) {
      return NextResponse.json(
        { status: 'error', message: 'Email dan password wajib diisi' },
        { status: 422 }
      );
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'Email tidak terdaftar' },
        { status: 404 }
      );
    }

    // 3. Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { status: 'error', message: 'Password salah' },
        { status: 422 }
      );
    }

    // 4. Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      nama: user.nama
    });

    // 5. Return response
    return NextResponse.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
