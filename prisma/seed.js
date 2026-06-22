// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('password123', 10);

  // 1. Seed users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hima.id' },
    update: {},
    create: {
      nama: 'Admin HIMA',
      email: 'admin@hima.id',
      password: adminPassword,
      role: 'admin',
    },
  });
  console.log(`Seeded user: ${admin.email} (admin)`);

  const student = await prisma.user.upsert({
    where: { email: 'budi@example.com' },
    update: {},
    create: {
      nama: 'Budi Santoso',
      email: 'budi@example.com',
      password: userPassword,
      role: 'mahasiswa',
    },
  });
  console.log(`Seeded user: ${student.email} (mahasiswa)`);

  // 2. Seed rooms
  const rooms = [
    {
      nama: 'Ruang HIMA',
      kapasitas: 30,
      fasilitas: JSON.stringify(['AC', 'Proyektor', 'Whiteboard']),
      deskripsi: 'Ruang utama himpunan',
      aktif: true,
    },
    {
      nama: 'Aula Serbaguna',
      kapasitas: 100,
      fasilitas: JSON.stringify(['AC', 'Sound System', 'Panggung']),
      deskripsi: 'Aula untuk acara besar',
      aktif: true,
    },
    {
      nama: 'Ruang Rapat',
      kapasitas: 15,
      fasilitas: JSON.stringify(['AC', 'Whiteboard']),
      deskripsi: 'Ruang rapat kecil',
      aktif: true,
    },
    {
      nama: 'Ruang Multimedia',
      kapasitas: 20,
      fasilitas: JSON.stringify(['AC', 'Proyektor', 'Speaker']),
      deskripsi: 'Untuk presentasi & workshop',
      aktif: false,
    }
  ];

  for (const room of rooms) {
    const seededRoom = await prisma.ruangan.upsert({
      where: { nama: room.nama },
      update: {},
      create: room,
    });
    console.log(`Seeded room: ${seededRoom.nama}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
