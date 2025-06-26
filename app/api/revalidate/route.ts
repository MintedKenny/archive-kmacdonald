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
    
    // If this is a verification request, return the token so we can see it
    if (body.challenge) {
      return NextResponse.json({ 
        message: 'Verification token received',
        token: body.challenge,
        challenge: body.challenge 
      })
    }

    // Handle actual webhook event
    // You can add logic here to check what type of event it is
    // and revalidate specific paths based on the event
    
    // For now, revalidate all main paths when any database changes
    const pathsToRevalidate = [
      '/',
      '/posts',
      '/open-questions', 
      '/brain-atm',
      '/links'
    ]

    for (const path of pathsToRevalidate) {
      revalidatePath(path)
    }

    return NextResponse.json({ 
      message: 'Revalidation successful', 
      paths: pathsToRevalidate 
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
} 