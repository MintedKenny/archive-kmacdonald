import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock the Notion client
vi.mock('@/lib/notion-client', () => ({
  createNotionPage: vi.fn()
}))

// Mock the rate limit utility
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => ({
    success: true,
    limit: 3,
    remaining: 2,
    reset: Date.now() + 1000
  })),
  getClientIp: vi.fn(() => '127.0.0.1')
}))

describe('/api/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NOTION_DATABASE_ID_COMMENTS = 'test-database-id'
  })

  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid input')
  })

  it('should validate comment length', async () => {
    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        questionId: 'test-id',
        comment: 'a'.repeat(1001)
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid input')
  })

  it('should create comment with valid input', async () => {
    const { createNotionPage } = await import('@/lib/notion-client')
    
    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        questionId: 'test-question-id',
        name: 'Test User',
        comment: 'This is a test comment'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(createNotionPage).toHaveBeenCalledWith('test-database-id', expect.any(Object))
  })

  it('should handle rate limiting', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    
    vi.mocked(rateLimit).mockReturnValue({
      success: false,
      limit: 3,
      remaining: 0,
      reset: Date.now() + 1000
    })

    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        questionId: 'test-question-id',
        comment: 'Test comment'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toContain('Too many requests')
    expect(response.headers.get('X-RateLimit-Limit')).toBe('3')
  })
}) 