// Prisma Seed Script
// File: prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user (password: admin123)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hima.id' },
    update: {},
    create: {
      nama: 'Admin HIMA',
      email: 'admin@hima.id',
      password: adminPassword,
      role: 'admin'
    }
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // Create test users
  const userPassword = await bcrypt.hash('password123', 10);
  const user1 = await prisma.user.upsert({
    where: { email: 'budi@example.com' },
    update: {},
    create: {
      nama: 'Budi Santoso',
      email: 'budi@example.com',
      password: userPassword,
      role: 'mahasiswa'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'sari@example.com' },
    update: {},
    create: {
      nama: 'Sari Dewi',
      email: 'sari@example.com',
      password: userPassword,
      role: 'mahasiswa'
    }
  });

  console.log(`✅ Test users created: ${user1.email}, ${user2.email}`);

  // Create sample rooms
  const rooms = [
    {
      nama: 'Ruang HIMA',
      kapasitas: 30,
      fasilitas: ['AC', 'Proyektor', 'Whiteboard'],
      deskripsi: 'Ruang utama himpunan',
      aktif: true
    },
    {
      nama: 'Aula Serbaguna',
      kapasitas: 100,
      fasilitas: ['AC', 'Sound System', 'Panggung'],
      deskripsi: 'Aula untuk acara besar',
      aktif: true
    },
    {
      nama: 'Ruang Rapat',
      kapasitas: 15,
      fasilitas: ['AC', 'Whiteboard'],
      deskripsi: 'Ruang rapat kecil',
      aktif: true
    },
    {
      nama: 'Ruang Multimedia',
      kapasitas: 20,
      fasilitas: ['AC', 'Proyektor', 'Speaker'],
      deskripsi: 'Untuk presentasi & workshop',
      aktif: false
    }
  ];

  for (const room of rooms) {
    await prisma.ruangan.create({
      data: room
    });
  }

  console.log(`✅ ${rooms.length} rooms created`);

  // Create bookings
  const room1 = await prisma.ruangan.findUnique({
    where: { nama: 'Ruang HIMA' }
  });

  const bookings = [
    {
      judul: 'Rapat Pengurus HIMA',
      deskripsi: 'Membahas program kerja semester',
      ruanganId: room1.id,
      userId: user1.id,
      tanggal: new Date('2026-06-25'),
      jamMulai: '13:00',
      jamSelesai: '15:00',
      status: 'Approved'
    },
    {
      judul: 'Seminar Akademik',
      deskripsi: 'Presentasi hasil penelitian',
      ruanganId: room1.id,
      userId: user2.id,
      tanggal: '2026-06-25',
      jamMulai: '09:00',
      jamSelesai: '12:00',
      status: 'Approved'
    },
    {
      judul: 'Workshop Python',
      deskripsi: 'Pelatihan pemrograman Python',
      ruanganId: room1.id,
      userId: user1.id,
      tanggal: '2026-06-26',
      jamMulai: '14:00',
      jamSelesai: '16:00',
      status: 'Pending'
    },
    {
      judul: 'Bimbingan Skripsi',
      deskripsi: 'Konsultasi mingguan',
      ruanganId: room1.id,
      userId: user1.id,
      tanggal: '2026-06-23',
      jamMulai: '09:00',
      jamSelesai: '11:00',
      status: 'Cancelled'
    },
    {
      judul: 'Presentasi Tugas',
      deskripsi: 'Presentasi tugas akhir',
      ruanganId: room1.id,
      userId: user2.id,
      tanggal: '2026-06-24',
      jamMulai: '10:00',
      jamSelesai: '12:00',
      status: 'Rejected',
      rejectReason: 'Jadwal sudah terpakai untuk acara kampus'
    }
  ];

  for (const booking of bookings) {
    await prisma.booking.create({
      data: booking
    });
  }

  console.log(`✅ ${bookings.length} bookings created`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log('  • Admin user: admin@hima.id (password: admin123)');
  console.log('  • Test users: budi@example.com, sari@example.com (password: password123)');
  console.log('  • Rooms: 4 rooms created');
  console.log('  • Bookings: 5 sample bookings created');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
