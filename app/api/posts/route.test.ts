import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from './route'

// Mock the posts utility - use relative path
vi.mock('../../posts/utils', () => ({
  getPosts: vi.fn()
}))

describe('/api/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return posts successfully', async () => {
    const { getPosts } = await import('../../posts/utils')
    const mockPosts = [
      { 
        id: '1', 
        slug: 'test-post-1',
        metadata: { 
          title: 'Test Post 1', 
          publishedAt: '2024-01-01', 
          summary: 'Test summary 1',
          tags: [] as string[]
        },
        blocks: []
      },
      { 
        id: '2', 
        slug: 'test-post-2',
        metadata: { 
          title: 'Test Post 2', 
          publishedAt: '2024-01-02', 
          summary: 'Test summary 2',
          tags: [] as string[]
        },
        blocks: []
      }
    ]
    
    vi.mocked(getPosts).mockResolvedValue(mockPosts)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockPosts)
    expect(getPosts).toHaveBeenCalledOnce()
  })

  it('should handle errors gracefully', async () => {
    const { getPosts } = await import('../../posts/utils')
    
    vi.mocked(getPosts).mockRejectedValue(new Error('Database error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch posts')
  })
}) 