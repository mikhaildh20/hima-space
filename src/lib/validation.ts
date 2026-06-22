// src/lib/validation.ts

/**
 * Validates email format using standard regex.
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates time format (HH:mm) in 24h range.
 */
export function validateTime(time: string): boolean {
  if (!time) return false;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}

/**
 * Checks if time1 is after time2. Both must be in format HH:mm.
 */
export function isTimeAfter(time1: string, time2: string): boolean {
  if (!validateTime(time1) || !validateTime(time2)) return false;
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  return h1 > h2 || (h1 === h2 && m1 > m2);
}

/**
 * Checks if a date string in format YYYY-MM-DD is not in the past.
 * The date comparison ignores hours/minutes/seconds.
 */
export function isDateNotPast(dateStr: string): boolean {
  if (!dateStr) return false;
  // Match YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;

  const inputDate = new Date(dateStr);
  if (isNaN(inputDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Prisma stores dates, we compare standard timestamp
  return inputDate >= today;
}
