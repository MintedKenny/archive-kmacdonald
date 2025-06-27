// Simple rate limiting for Vercel serverless functions
// Uses in-memory storage - suitable for short-lived serverless functions

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// Simple in-memory cache - will reset with each cold start
const cache = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000 // 1 minute
): RateLimitResult {
  const now = Date.now()
  const resetTime = now + windowMs

  // Get or create entry for this identifier
  const entry = cache.get(identifier)

  // If no entry or window has expired, start fresh
  if (!entry || now >= entry.resetTime) {
    cache.set(identifier, { count: 1, resetTime })
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTime
    }
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime
    }
  }

  // Increment counter
  entry.count++
  cache.set(identifier, entry)

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime
  }
}

export function getClientIp(request: Request): string {
  // Try different headers that Vercel might use
  const headers = [
    'x-forwarded-for',
    'x-real-ip', 
    'x-client-ip'
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0]?.trim() || 'unknown'
    }
  }

  return 'unknown'
} 