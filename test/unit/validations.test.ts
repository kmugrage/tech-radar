import { describe, it, expect } from 'vitest';
import {
  createRadarSchema,
  updateRadarSchema,
  createBlipSchema,
  updateBlipSchema,
  updateQuadrantSchema,
  updateRingSchema,
  registerSchema,
  loginSchema,
} from '@/lib/validations';

describe('validation schemas', () => {
  describe('createRadarSchema', () => {
    it('validates valid radar data', () => {
      const validData = {
        name: 'My Tech Radar',
        description: 'A radar for tracking technologies',
      };

      const result = createRadarSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('validates radar without description', () => {
      const validData = {
        name: 'My Tech Radar',
      };

      const result = createRadarSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const invalidData = {
        name: '',
        description: 'Test',
      };

      const result = createRadarSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('rejects name exceeding 100 characters', () => {
      const invalidData = {
        name: 'a'.repeat(101),
      };

      const result = createRadarSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects description exceeding 500 characters', () => {
      const invalidData = {
        name: 'Valid Name',
        description: 'a'.repeat(501),
      };

      const result = createRadarSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts name at maximum length (100 chars)', () => {
      const validData = {
        name: 'a'.repeat(100),
      };

      const result = createRadarSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('accepts description at maximum length (500 chars)', () => {
      const validData = {
        name: 'Test',
        description: 'a'.repeat(500),
      };

      const result = createRadarSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateRadarSchema', () => {
    it('is the same as createRadarSchema', () => {
      expect(updateRadarSchema).toBe(createRadarSchema);
    });
  });

  describe('createBlipSchema', () => {
    it('validates valid blip data', () => {
      const validData = {
        name: 'React',
        description: 'JavaScript library',
        quadrantId: 'q1',
        ringId: 'r1',
        isNew: true,
      };

      const result = createBlipSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('defaults isNew to true when not provided', () => {
      const validData = {
        name: 'React',
        quadrantId: 'q1',
        ringId: 'r1',
      };

      const result = createBlipSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isNew).toBe(true);
      }
    });

    it('validates blip without description', () => {
      const validData = {
        name: 'React',
        quadrantId: 'q1',
        ringId: 'r1',
      };

      const result = createBlipSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const invalidData = {
        name: '',
        quadrantId: 'q1',
        ringId: 'r1',
      };

      const result = createBlipSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects name exceeding 100 characters', () => {
      const invalidData = {
        name: 'a'.repeat(101),
        quadrantId: 'q1',
        ringId: 'r1',
      };

      const result = createBlipSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects description exceeding 1000 characters', () => {
      const invalidData = {
        name: 'React',
        description: 'a'.repeat(1001),
        quadrantId: 'q1',
        ringId: 'r1',
      };

      const result = createBlipSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects missing quadrantId', () => {
      const invalidData = {
        name: 'React',
        ringId: 'r1',
      };

      const result = createBlipSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects missing ringId', () => {
      const invalidData = {
        name: 'React',
        quadrantId: 'q1',
      };

      const result = createBlipSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts isNew as false', () => {
      const validData = {
        name: 'React',
        quadrantId: 'q1',
        ringId: 'r1',
        isNew: false,
      };

      const result = createBlipSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isNew).toBe(false);
      }
    });
  });

  describe('updateBlipSchema', () => {
    it('is the same as createBlipSchema', () => {
      expect(updateBlipSchema).toBe(createBlipSchema);
    });
  });

  describe('updateQuadrantSchema', () => {
    it('validates valid quadrant data', () => {
      const validData = {
        name: 'Techniques',
        color: '#ff0000',
      };

      const result = updateQuadrantSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('accepts various valid hex colors', () => {
      const colors = ['#000000', '#FFFFFF', '#123abc', '#ABC123', '#f0f0f0'];

      colors.forEach(color => {
        const result = updateQuadrantSchema.safeParse({
          name: 'Test',
          color,
        });
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid hex colors', () => {
      const invalidColors = [
        '#12345',      // Too short
        '#1234567',    // Too long
        '#gggggg',     // Invalid hex characters
        'red',         // Named color
        'rgb(255,0,0)', // RGB format
        '#12345g',     // Invalid character
      ];

      invalidColors.forEach(color => {
        const result = updateQuadrantSchema.safeParse({
          name: 'Test',
          color,
        });
        expect(result.success).toBe(false);
      });
    });

    it('rejects empty name', () => {
      const invalidData = {
        name: '',
        color: '#ff0000',
      };

      const result = updateQuadrantSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects name exceeding 50 characters', () => {
      const invalidData = {
        name: 'a'.repeat(51),
        color: '#ff0000',
      };

      const result = updateQuadrantSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts name at maximum length (50 chars)', () => {
      const validData = {
        name: 'a'.repeat(50),
        color: '#ff0000',
      };

      const result = updateQuadrantSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateRingSchema', () => {
    it('validates valid ring data', () => {
      const validData = {
        name: 'Adopt',
      };

      const result = updateRingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const invalidData = {
        name: '',
      };

      const result = updateRingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects name exceeding 50 characters', () => {
      const invalidData = {
        name: 'a'.repeat(51),
      };

      const result = updateRingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts name at maximum length (50 chars)', () => {
      const validData = {
        name: 'a'.repeat(50),
      };

      const result = updateRingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('registerSchema', () => {
    it('validates valid registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!@#',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects password shorter than 12 characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Short1!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('12 characters');
      }
    });

    it('rejects password without lowercase letter', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'UPPERCASE123!@#',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('lowercase'))).toBe(true);
      }
    });

    it('rejects password without uppercase letter', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'lowercase123!@#',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('uppercase'))).toBe(true);
      }
    });

    it('rejects password without number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'NoNumberPass!@#',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('number'))).toBe(true);
      }
    });

    it('rejects password without special character', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'NoSpecialChar123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('special'))).toBe(true);
      }
    });

    it('rejects invalid email format', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
      ];

      invalidEmails.forEach(email => {
        const result = registerSchema.safeParse({
          name: 'John Doe',
          email,
          password: 'ValidPass123!',
        });
        expect(result.success).toBe(false);
      });
    });

    it('accepts various valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@subdomain.example.com',
      ];

      validEmails.forEach(email => {
        const result = registerSchema.safeParse({
          name: 'John Doe',
          email,
          password: 'ValidPass123!',
        });
        expect(result.success).toBe(true);
      });
    });

    it('rejects empty name', () => {
      const invalidData = {
        name: '',
        email: 'john@example.com',
        password: 'ValidPass123!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects name exceeding 100 characters', () => {
      const invalidData = {
        name: 'a'.repeat(101),
        email: 'john@example.com',
        password: 'ValidPass123!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts password at minimum length with all requirements', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Abcdefgh123!',  // Exactly 12 chars
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('validates valid login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'anypassword',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'notanemail',
        password: 'anypassword',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const invalidData = {
        email: 'john@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts any non-empty password (validation happens server-side)', () => {
      const validData = {
        email: 'john@example.com',
        password: '1',  // Short password is valid for login
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
