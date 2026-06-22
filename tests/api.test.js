import { GET as getRooms } from '@/app/api/ruangan/route';
import { POST as loginUser } from '@/app/api/auth/login/route';
import { POST as createBooking } from '@/app/api/booking/route';
import { createTestUser, generateToken, cleanup } from './setup';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

describe('API Route Integration Tests', () => {
  let adminUser;
  let studentUser;
  let adminToken;
  let studentToken;
  let testRoom;

  beforeAll(async () => {
    adminUser = await createTestUser('admin');
    studentUser = await createTestUser('mahasiswa');
    adminToken = generateToken(adminUser);
    studentToken = generateToken(studentUser);

    // Create a test room directly
    testRoom = await prisma.ruangan.create({
      data: {
        nama: `Ruang Test ${Date.now()}`,
        kapasitas: 15,
        fasilitas: JSON.stringify(['AC', 'Whiteboard']),
        aktif: true
      }
    });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully with correct credentials', async () => {
      const body = {
        email: studentUser.email,
        password: 'password123'
      };

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const res = await loginUser(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe('success');
      expect(data.data.token).toBeDefined();
      expect(data.data.user.email).toBe(studentUser.email);
    });

    test('should fail to login with wrong password', async () => {
      const body = {
        email: studentUser.email,
        password: 'wrongpassword'
      };

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const res = await loginUser(req);
      expect(res.status).toBe(422);

      const data = await res.json();
      expect(data.status).toBe('error');
      expect(data.message).toBe('Password salah');
    });
  });

  describe('GET /api/ruangan', () => {
    test('should list active rooms', async () => {
      const req = new NextRequest('http://localhost/api/ruangan', {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });

      const res = await getRooms(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe('success');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.some(r => r.id === testRoom.id)).toBe(true);
    });
  });

  describe('POST /api/booking', () => {
    test('should create booking pending approval', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tanggalStr = tomorrow.toISOString().split('T')[0];

      const body = {
        judul: 'Rapat Koordinasi HIMA',
        deskripsi: 'Membahas program kerja baru',
        ruanganId: testRoom.id,
        tanggal: tanggalStr,
        jamMulai: '09:00',
        jamSelesai: '11:00'
      };

      const req = new NextRequest('http://localhost/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify(body)
      });

      const res = await createBooking(req);
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.status).toBe('success');
      expect(data.data.judul).toBe('Rapat Koordinasi HIMA');
      expect(data.data.status).toBe('Pending');
    });

    test('should detect booking time conflict if room is already approved at the same time', async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const tanggalStr = nextWeek.toISOString().split('T')[0];

      // Create an approved booking first in the database
      await prisma.booking.create({
        data: {
          judul: 'Event Approved',
          ruanganId: testRoom.id,
          userId: studentUser.id,
          tanggal: new Date(tanggalStr + 'T00:00:00.000Z'),
          jamMulai: '13:00',
          jamSelesai: '15:00',
          status: 'Approved'
        }
      });

      const body = {
        judul: 'Event Bentrok',
        ruanganId: testRoom.id,
        tanggal: tanggalStr,
        jamMulai: '14:00',
        jamSelesai: '16:00'
      };

      const req = new NextRequest('http://localhost/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify(body)
      });

      const res = await createBooking(req);
      expect(res.status).toBe(422);

      const data = await res.json();
      expect(data.status).toBe('error');
      expect(data.message).toContain('dibooking');
    });
  });
});
