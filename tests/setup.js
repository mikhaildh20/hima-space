import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function createTestUser(role = 'mahasiswa') {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const email = `test_${role}_${Date.now()}@example.com`;

  return prisma.user.create({
    data: {
      nama: `Test User ${role}`,
      email: email,
      password: hashedPassword,
      role
    }
  });
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'hima_space_jwt_secret_token_signature_key_2026_super_secure',
    { expiresIn: '1h' }
  );
}

export async function cleanup() {
  await prisma.booking.deleteMany({
    where: {
      user: {
        email: {
          startsWith: 'test_'
        }
      }
    }
  });
  
  await prisma.ruangan.deleteMany({
    where: {
      nama: {
        startsWith: 'Ruang Test'
      }
    }
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: 'test_'
      }
    }
  });
}
