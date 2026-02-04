/**
 * Simple in-memory rate limiter for authentication endpoints
 *
 * Note: This implementation uses in-memory storage and will reset when the server restarts.
 * For production with multiple server instances, consider using Redis or a similar distributed cache.
 */

type RateLimitStore = {
  [key: string]: {
    count: number;
    resetAt: number;
  };
};

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Rate limit based on IP address or identifier
 *
 * @param identifier - Usually the IP address or user identifier
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns Rate limit result with success status and metadata
 */
export function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  // Get or create rate limit entry
  let entry = store[key];

  // If no entry or window expired, create new entry
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    store[key] = entry;
  }

  // Increment count
  entry.count++;

  const remaining = Math.max(0, limit - entry.count);
  const success = entry.count <= limit;

  return {
    success,
    remaining,
    reset: entry.resetAt,
  };
}

/**
 * Get client IP address from request
 * Handles various proxy scenarios (Cloudflare, AWS, etc.)
 */
export function getClientIp(request: Request): string {
  // Check Cloudflare header
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  // Check X-Forwarded-For (most common proxy header)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // Check X-Real-IP
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  // Fallback to 'unknown' if no IP found
  return "unknown";
}

/**
 * Create rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": "5",
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.reset).toISOString(),
  };
}
