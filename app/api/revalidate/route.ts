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
      // Log the token so you can see it
      console.log('Verification token received:', body.verification_token)
      
      // Return success for verification
      return NextResponse.json({ 
        message: 'Verification token received',
        received_token: body.verification_token
      })
    }

    // Handle actual webhook events after verification
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