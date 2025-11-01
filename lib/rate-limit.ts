/**
 * In-memory rate limiting utility
 * Tracks requests per IP address with sliding window
 */

import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Check if request is within rate limit
 * @param request - NextRequest object
 * @param limit - Max requests allowed
 * @param window - Time window in milliseconds
 * @returns { allowed: boolean, remaining: number }
 */
export function rateLimit(
  request: NextRequest,
  limit = 10,
  window = 60000, // 1 minute default
): { allowed: boolean; remaining: number } {
  // Extract IP address from request headers
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // First request or window expired
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return { allowed: true, remaining: limit - 1 };
  }

  // Limit exceeded
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  // Increment and allow
  record.count++;
  return { allowed: true, remaining: limit - record.count };
}

/**
 * Cleanup old entries (call periodically to prevent memory leaks)
 */
export function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}
