import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Handle Notion webhook verification (GET request)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')
  
  if (challenge) {
    // Return the challenge token to verify the webhook
    return NextResponse.json({ challenge })
  }
  
  return NextResponse.json({ error: 'No challenge provided' }, { status: 400 })
}

// Handle actual webhook events (POST request)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle Notion's verification request
    if (body.verification_token) {
      return NextResponse.json({ message: 'Verification successful' })
    }

    // Parse webhook event to determine which paths to revalidate
    const pathsToRevalidate = determinePathsToRevalidate(body)
    
    for (const path of pathsToRevalidate) {
      revalidatePath(path)
    }

    return NextResponse.json({ 
      message: 'Selective revalidation successful', 
      paths: pathsToRevalidate,
      eventType: body.type
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

function determinePathsToRevalidate(webhookEvent: any): string[] {
  const paths: string[] = []
  const eventType = webhookEvent.type
  const entityType = webhookEvent.entity?.type
  const entityId = webhookEvent.entity?.id

  // Map your database IDs to specific paths
  const DATABASE_PATH_MAP: Record<string, string[]> = {
    [process.env.NOTION_DATABASE_ID_POSTS || '']: ['/posts', '/'],
    [process.env.NOTION_DATABASE_ID_QUESTIONS || '']: ['/open-questions'],
    [process.env.NOTION_DATABASE_ID_BRAIN || '']: ['/brain-atm'],
    [process.env.NOTION_DATABASE_ID_COMMENTS || '']: ['/open-questions'], // Comments affect questions page
  }

  // Handle specific page updates (like the links page)
  if (entityType === 'page' && entityId === process.env.NOTION_PAGE_ID_LINKS) {
    paths.push('/links')
    return [...new Set(paths)] // Return early for links page
  }

  // Always revalidate the home page for any published content changes
  if (eventType.includes('created') || eventType.includes('properties_updated')) {
    paths.push('/')
  }

  // Handle database events
  if (entityType === 'database') {
    const dbPaths = DATABASE_PATH_MAP[entityId]
    if (dbPaths) {
      paths.push(...dbPaths)
    }
  }

  // Handle page events - need to determine which database the page belongs to
  if (entityType === 'page') {
    const parentId = webhookEvent.data?.parent?.id
    
    if (parentId && DATABASE_PATH_MAP[parentId]) {
      paths.push(...DATABASE_PATH_MAP[parentId])
      
      // For blog posts, also revalidate the specific post page if we can determine the slug
      if (parentId === process.env.NOTION_DATABASE_ID_POSTS) {
        paths.push('/posts')
      }
    }
  }

  // Handle comment events
  if (entityType === 'comment') {
    paths.push('/open-questions')
  }

  // Remove duplicates and return
  return [...new Set(paths)]
} 