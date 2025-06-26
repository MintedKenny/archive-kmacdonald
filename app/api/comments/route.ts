import { NextRequest, NextResponse } from 'next/server'
import { createNotionPage } from '@/lib/notion-client'

export async function POST(request: NextRequest) {
  try {
    const { questionId, name, comment } = await request.json()

    if (!questionId || !comment) {
      return NextResponse.json(
        { error: 'Question ID and comment are required' },
        { status: 400 }
      )
    }

    if (!process.env.NOTION_DATABASE_ID_COMMENTS) {
      return NextResponse.json(
        { error: 'Comments database not configured' },
        { status: 500 }
      )
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
        checkbox: true, // Auto-publish new comments
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
} 