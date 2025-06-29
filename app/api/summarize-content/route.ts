import { NextRequest, NextResponse } from 'next/server'
import { getNotionPage, updateNotionPage, appendBlocksToPage } from 'lib/notion/notion-client'
import { extractUrlFromPage, extractTitleFromPage, createTitleProperty } from 'lib/notion/notion-utils'
import { createSummarizationMessages } from 'lib/prompts/summarize'
import { createSummaryBlocks } from 'lib/notion/content-to-notion'
import OpenAI from 'openai'

interface JinaResponse {
  data: {
    content: string
    title: string
    url: string
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Endpoint is working!',
    timestamp: new Date().toISOString(),
    hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
    hasNotionToken: !!process.env.NOTION_TOKEN,
    nodeEnv: process.env.NODE_ENV
  })
}

export async function POST(request: NextRequest) {
  console.log('🚀 Starting content summarization...')
  
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Research Content Summarizer",
      },
    })

    // Extract page ID from query params OR request body
    const { searchParams } = new URL(request.url)
    let pageId = searchParams.get('id') // For manual testing
    
    // If no page ID in URL, try to get it from the request body (Notion webhook)
    if (!pageId) {
      try {
        const body = await request.json()
        console.log('📨 Webhook payload:', JSON.stringify(body, null, 2))
        
        // The page ID is in body.data.id for Notion webhooks
        pageId = body.data?.id || body.id || body.page_id || body.pageId
        
        // If still no page ID, check if it's in a properties object
        if (!pageId && body.properties) {
          // Look for ID in various possible property names
          pageId = body.properties.id?.id || 
                   body.properties.ID?.id || 
                   body.properties.Page?.id ||
                   body.properties.page_id?.id
        }
      } catch (e) {
        console.error('Error parsing request body:', e)
      }
    }
    
    if (!pageId) {
      return NextResponse.json({ 
        error: 'Page ID is required. Provide it as ?id=<page_id> or in the request body.' 
      }, { status: 400 })
    }
    
    console.log('📄 Using page ID:', pageId)

    // Step 1: Get Notion page and extract URL
    console.log('📄 Fetching Notion page...')
    const page = await getNotionPage(pageId)
    const url = extractUrlFromPage(page)
    
    if (!url) {
      return NextResponse.json({ error: 'No URL found in page properties' }, { status: 400 })
    }

    // Step 2: Extract content using Jina Reader
    console.log(`🌐 Extracting content from: ${url}`)
    const jinaResponse = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Research-Summarizer/1.0'
      },
    })

    if (!jinaResponse.ok) {
      throw new Error(`Jina Reader failed: ${jinaResponse.status} ${jinaResponse.statusText}`)
    }

    const jinaData: JinaResponse = await jinaResponse.json()
    const content = jinaData.data?.content
    const title = jinaData.data?.title || 'Untitled'

    if (!content?.trim()) {
      return NextResponse.json({ 
        error: 'No content extracted from URL',
        url 
      }, { status: 400 })
    }

    console.log(`📄 Content extracted: ${content.length} characters`)

    // Step 3: Generate AI summary
    console.log('🤖 Generating AI summary...')
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: createSummarizationMessages(content),
      max_tokens: 1500,
      temperature: 0.7,
    })

    const summary = completion.choices[0]?.message?.content
    if (!summary?.trim()) {
      throw new Error('Failed to generate summary - empty response')
    }

    console.log(`✅ Summary generated: ${summary.length} characters`)

    // Step 4: Convert summary to Notion blocks using AST parsing
    console.log('🔄 Converting summary to Notion blocks...')
    const summaryBlocks = createSummaryBlocks(summary, url)
    
    console.log(`📝 Created ${summaryBlocks.length} Notion blocks`)

    // Step 5: Append blocks to Notion page
    console.log('📤 Appending blocks to Notion page...')
    await appendBlocksToPage(pageId, summaryBlocks)

    // Step 6: Update page title if needed
    const currentTitle = extractTitleFromPage(page)
    if (!currentTitle || currentTitle === 'Untitled') {
      console.log('📝 Updating page title...')
      await updateNotionPage(pageId, {
        'Title': createTitleProperty(title)
      })
    }

    console.log('🎉 Content summarization completed successfully')

    return NextResponse.json({ 
      success: true,
      message: 'Content summarized and appended successfully',
      data: {
        title,
        url,
        summaryLength: summary.length,
        blocksCreated: summaryBlocks.length,
        model: completion.model,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('💥 Summarization error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process content summarization', 
        message: errorMessage,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}