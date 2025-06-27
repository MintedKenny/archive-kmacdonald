import { NextRequest, NextResponse } from 'next/server'
import { createNotionPage } from '@/lib/notion-client'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const commentSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  name: z.string().max(100, 'Name must be 100 characters or less').optional(),
  comment: z.string()
    .min(1, 'Comment is required')
    .max(1000, 'Comment must be 1000 characters or less')
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 requests per second
    const clientIp = getClientIp(request)
    const rateLimitResult = rateLimit(clientIp, 3, 1000) // 3 requests per 1 second

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString()
          }
        }
      )
    }

    // Input validation
    const body = await request.json()
    const validation = commentSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { questionId, name, comment } = validation.data

    if (!process.env.NOTION_DATABASE_ID_COMMENTS) {
      throw new Error('Comments database not configured')
    }

    // Create comment in Notion with auto-publish
    await createNotionPage(process.env.NOTION_DATABASE_ID_COMMENTS, {
      Comment: {
        title: [
          {
            text: {
              content: comment,
            },
          },
        ],
      },
      Name: {
        rich_text: [
          {
            text: {
              content: name || 'Anonymous',
            },
          },
        ],
      },
      Question: {
        relation: [
          {
            id: questionId,
          },
        ],
      },
      Published: {
        checkbox: true,
      },
    })

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString()
        }
      }
    )
  } catch (error) {
    console.error('Error creating comment:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
} 