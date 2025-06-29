export interface NotionBlock {
  object: string
  type: string
  [key: string]: any
}

// Convert markdown-like summary to Notion blocks
export function createSummaryBlocks(summary: string, sourceUrl?: string): NotionBlock[] {
  const blocks: NotionBlock[] = []
  
  // Add divider
  blocks.push({
    object: 'block',
    type: 'divider',
    divider: {}
  })
  
  // Add header
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: '🤖 AI Generated Summary'
          }
        }
      ]
    }
  })
  
  // Process summary content
  const summaryBlocks = parseMarkdownToNotionBlocks(summary)
  blocks.push(...summaryBlocks)
  
  // Add metadata footer
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  blocks.push({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: `Generated on ${timestamp}`
          },
          annotations: {
            italic: true,
            color: 'gray'
          }
        }
      ]
    }
  })
  
  return blocks
}

// Parse markdown-like content to Notion blocks
function parseMarkdownToNotionBlocks(content: string): NotionBlock[] {
  const blocks: NotionBlock[] = []
  const lines = content.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (!trimmed) continue
    
    // Headers
    if (trimmed.startsWith('### ')) {
      blocks.push(createHeading3Block(trimmed.slice(4)))
    } else if (trimmed.startsWith('## ')) {
      blocks.push(createHeading2Block(trimmed.slice(3)))
    } else if (trimmed.startsWith('# ')) {
      blocks.push(createHeading1Block(trimmed.slice(2)))
    }
    // Bullet points
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push(createBulletBlock(trimmed.slice(2)))
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s/, '')
      blocks.push(createNumberedBlock(text))
    }
    // Regular paragraphs
    else {
      blocks.push(createParagraphBlock(trimmed))
    }
  }
  
  return blocks
}

// Helper functions for creating specific block types
function createHeading1Block(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'heading_1',
    heading_1: {
      rich_text: [{ type: 'text', text: { content: text } }]
    }
  }
}

function createHeading2Block(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: text } }]
    }
  }
}

function createHeading3Block(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'heading_3',
    heading_3: {
      rich_text: [{ type: 'text', text: { content: text } }]
    }
  }
}

function createParagraphBlock(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: text } }]
    }
  }
}

function createBulletBlock(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ type: 'text', text: { content: text } }]
    }
  }
}

function createNumberedBlock(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'numbered_list_item',
    numbered_list_item: {
      rich_text: [{ type: 'text', text: { content: text } }]
    }
  }
}

// Create a callout block for important information
export function createCalloutBlock(text: string, emoji: string = '💡'): NotionBlock {
  return {
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: [{ type: 'text', text: { content: text } }],
      icon: { emoji }
    }
  }
}

// Create a quote block
export function createQuoteBlock(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'quote',
    quote: {
      rich_text: [{ type: 'text', text: { content: text } }]
    }
  }
} 