// src/lib/auth.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hima_space_jwt_secret_token_signature_key_2026_super_secure';

export interface UserPayload {
  id: number;
  email: string;
  role: 'admin' | 'mahasiswa';
}

/**
 * Generates a stateless JWT token valid for 24 hours.
 */
export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Extracts and verifies JWT from the Authorization Bearer header.
 */
export async function verifyToken(request: Request): Promise<{ user?: UserPayload; error?: string }> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return { error: 'Token tidak ditemukan' };
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return { error: 'Format token tidak valid' };
    }

    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return { user: decoded };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token expired' };
    }
    return { error: 'Token tidak valid' };
  }
}
