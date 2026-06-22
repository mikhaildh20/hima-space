import { validateEmail, validateTime, isTimeAfter, isDateNotPast } from '@/lib/validation';

describe('Validation Unit Tests', () => {
  describe('validateEmail', () => {
    test('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.id')).toBe(true);
    });

    test('should reject invalid emails', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('plain')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test@domain')).toBe(false);
    });
  });

  describe('validateTime', () => {
    test('should validate correct 24h times', () => {
      expect(validateTime('00:00')).toBe(true);
      expect(validateTime('08:30')).toBe(true);
      expect(validateTime('14:15')).toBe(true);
      expect(validateTime('23:59')).toBe(true);
    });

    test('should reject invalid times', () => {
      expect(validateTime('')).toBe(false);
      expect(validateTime('24:00')).toBe(false);
      expect(validateTime('12:60')).toBe(false);
      expect(validateTime('8:30')).toBe(false);
      expect(validateTime('08:3')).toBe(false);
      expect(validateTime('abc')).toBe(false);
    });
  });

  describe('isTimeAfter', () => {
    test('should return true if first time is after second time', () => {
      expect(isTimeAfter('09:00', '08:00')).toBe(true);
      expect(isTimeAfter('14:30', '14:15')).toBe(true);
      expect(isTimeAfter('23:59', '00:00')).toBe(true);
    });

    test('should return false if first time is before or equal to second time', () => {
      expect(isTimeAfter('08:00', '09:00')).toBe(false);
      expect(isTimeAfter('14:15', '14:30')).toBe(false);
      expect(isTimeAfter('12:00', '12:00')).toBe(false);
    });

    test('should return false on invalid time inputs', () => {
      expect(isTimeAfter('25:00', '12:00')).toBe(false);
      expect(isTimeAfter('12:00', 'invalid')).toBe(false);
    });
  });

  describe('isDateNotPast', () => {
    test('should return true for today and future dates', () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      expect(isDateNotPast(today)).toBe(true);
      expect(isDateNotPast(tomorrow)).toBe(true);
    });

    test('should return false for past dates', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      expect(isDateNotPast(yesterday)).toBe(false);
      expect(isDateNotPast('2020-01-01')).toBe(false);
    });

    test('should return false for invalid formats', () => {
      expect(isDateNotPast('')).toBe(false);
      expect(isDateNotPast('01-01-2026')).toBe(false);
      expect(isDateNotPast('invalid-date')).toBe(false);
    });
  });
});
