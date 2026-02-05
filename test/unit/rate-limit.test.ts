import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit';

describe('rate-limit utilities', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    vi.clearAllMocks();
  });

  describe('rateLimit', () => {
    it('allows requests under the limit', async () => {
      const result = await rateLimit('test-key-1', 3, 60000);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('tracks multiple requests from same identifier', async () => {
      await rateLimit('test-key-2', 3, 60000);
      const result2 = await rateLimit('test-key-2', 3, 60000);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);
    });

    it('blocks requests over the limit', async () => {
      await rateLimit('test-key-3', 2, 60000);
      await rateLimit('test-key-3', 2, 60000);
      const result = await rateLimit('test-key-3', 2, 60000);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.reset).toBeGreaterThan(Date.now());
    });

    it('resets after time window expires', async () => {
      const windowMs = 100; // 100ms window
      await rateLimit('test-key-4', 1, windowMs);

      // First request fills the limit
      const blocked = await rateLimit('test-key-4', 1, windowMs);
      expect(blocked.success).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, windowMs + 10));

      // Should allow request again
      const allowed = await rateLimit('test-key-4', 1, windowMs);
      expect(allowed.success).toBe(true);
    });

    it('handles different identifiers independently', async () => {
      await rateLimit('user-1', 1, 60000);
      await rateLimit('user-1', 1, 60000);

      // user-1 is blocked
      const result1 = await rateLimit('user-1', 1, 60000);
      expect(result1.success).toBe(false);

      // user-2 should still be allowed
      const result2 = await rateLimit('user-2', 1, 60000);
      expect(result2.success).toBe(true);
    });

    it('returns correct reset time', async () => {
      const windowMs = 10000;
      await rateLimit('test-key-5', 1, windowMs);
      await rateLimit('test-key-5', 1, windowMs);

      const result = await rateLimit('test-key-5', 1, windowMs);
      expect(result.reset).toBeGreaterThan(Date.now());
      expect(result.reset).toBeLessThanOrEqual(Date.now() + windowMs);
    });

    it('handles limit of 0 correctly', async () => {
      const result = await rateLimit('test-key-6', 0, 60000);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('handles very high limits', async () => {
      const result = await rateLimit('test-key-7', 1000000, 60000);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(999999);
    });
  });

  describe('getClientIp', () => {
    it('extracts IP from x-real-ip header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-real-ip': '192.168.1.100',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.100');
    });

    it('extracts IP from x-forwarded-for header (first IP)', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('203.0.113.1');
    });

    it('extracts IP from cf-connecting-ip header (Cloudflare)', () => {
      const request = new Request('http://localhost', {
        headers: {
          'cf-connecting-ip': '198.51.100.50',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('198.51.100.50');
    });

    it('prioritizes cf-connecting-ip over others', () => {
      const request = new Request('http://localhost', {
        headers: {
          'cf-connecting-ip': '198.51.100.50',
          'x-forwarded-for': '203.0.113.1',
          'x-real-ip': '192.168.1.1',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('198.51.100.50');
    });

    it('returns unknown when no IP headers present', () => {
      const request = new Request('http://localhost');

      const ip = getClientIp(request);
      expect(ip).toBe('unknown');
    });

    it('handles empty header values', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('unknown');
    });

    it('trims whitespace from forwarded-for IPs', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '  203.0.113.1  , 198.51.100.1',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('203.0.113.1');
    });
  });

  describe('getRateLimitHeaders', () => {
    it('formats rate limit headers correctly', () => {
      const result = { success: true, remaining: 2, reset: Date.now() + 45000 };
      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('5');
      expect(headers['X-RateLimit-Remaining']).toBe('2');
      expect(headers['X-RateLimit-Reset']).toBeTruthy();
    });

    it('handles zero remaining', () => {
      const result = { success: false, remaining: 0, reset: Date.now() + 30000 };
      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('0');
    });

    it('includes reset time in ISO format', () => {
      const resetTime = Date.now() + 60000;
      const result = { success: false, remaining: 0, reset: resetTime };
      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Reset']).toBe(new Date(resetTime).toISOString());
    });

    it('always has limit of 5', () => {
      const result = { success: true, remaining: 3, reset: Date.now() };
      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('5');
    });

    it('converts remaining to string', () => {
      const result = { success: true, remaining: 999999, reset: Date.now() };
      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('999999');
    });
  });
});
