// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    status: 'success',
    message: 'Berhasil logout'
  });
}
