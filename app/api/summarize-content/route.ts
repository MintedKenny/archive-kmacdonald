import { NextRequest, NextResponse } from 'next/server'
import { getNotionPage, updateNotionPage, appendBlocksToPage } from 'lib/notion/notion-client'
import { extractUrlFromPage, extractTitleFromPage, createTitleProperty } from 'lib/notion/notion-utils'
import { createSummarizationMessages } from 'lib/prompts/summarize'
import { createSummaryBlocks } from 'lib/notion/content-to-notion'
import OpenAI from 'openai'

// Configure OpenAI client to use OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "Research Content Summarizer",
  },
})

export async function POST(request: NextRequest) {
  try {
    // Get page ID from request
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('id')
    
    if (!pageId) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 })
    }

    console.log(`Processing content summarization for page: ${pageId}`)

    // 1. Retrieve page from Notion and extract URL
    const page = await getNotionPage(pageId)
    const url = extractUrlFromPage(page)
    
    if (!url) {
      return NextResponse.json({ error: 'No URL found in page properties' }, { status: 400 })
    }

    console.log(`Extracting content from URL: ${url}`)

    // 2. Extract content using Jina Reader
    const jinaResponse = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Research Content Summarizer'
      },
    })

    if (!jinaResponse.ok) {
      throw new Error(`Jina Reader failed: ${jinaResponse.status} ${jinaResponse.statusText}`)
    }

    const jinaData = await jinaResponse.json()
    const content = jinaData.content || jinaData.text || ''

    if (!content) {
      return NextResponse.json({ error: 'No content extracted from URL' }, { status: 400 })
    }

    console.log(`Content extracted, length: ${content.length} characters`)

    // 3. Generate summary using OpenRouter
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: createSummarizationMessages(content),
      max_tokens: 1500,
      temperature: 0.7,
    })

    const summary = completion.choices[0]?.message?.content
    if (!summary) {
      throw new Error('Failed to generate summary')
    }

    console.log('Summary generated successfully')

    // 4. Convert summary to Notion blocks and append to page
    const summaryBlocks = createSummaryBlocks(summary, url)
    await appendBlocksToPage(pageId, summaryBlocks)

    // 5. Update page title if needed (status is now handled by the button)
    const currentTitle = extractTitleFromPage(page)
    const urlTitle = jinaData.title || 'Untitled'
    
    // Only update title if it's empty or generic
    if (!currentTitle || currentTitle === 'Untitled') {
      const updates = {
        'Title': createTitleProperty(urlTitle)
      }
      await updateNotionPage(pageId, updates)
    }

    console.log('Page updated successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Content summarized and appended successfully',
      title: urlTitle,
      summaryLength: summary.length,
      model: completion.model
    })

  } catch (error) {
    console.error('Error in summarize-content API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process content', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    )
  }
} 