import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import type { Root, Content, PhrasingContent, ListItem, Heading, Paragraph, List, BlockContent } from 'mdast'
import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints'

// Define proper rich text types based on Notion API docs
interface RichTextRequest {
  type: 'text'
  text: {
    content: string
    link?: { url: string } | null
  }
  annotations?: {
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
    code?: boolean
    color?: 'default' | 'gray' | 'brown' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'red' | 'gray_background' | 'brown_background' | 'orange_background' | 'yellow_background' | 'green_background' | 'blue_background' | 'purple_background' | 'pink_background' | 'red_background'
  }
}

// Notion block types for our use case
export type NotionBlockRequest = BlockObjectRequest

// AST processor setup
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)

// Main function to convert summary to Notion blocks
export function createSummaryBlocks(summary: string, sourceUrl?: string): NotionBlockRequest[] {
  const blocks: NotionBlockRequest[] = []
  
  // Add divider and header
  blocks.push(createHeaderBlock())
  
  // Convert markdown to Notion blocks using AST
  const contentBlocks = markdownToNotionBlocks(summary)
  blocks.push(...contentBlocks)
  
  // Add metadata footer
  blocks.push(createTimestampBlock())
  blocks.push(createDividerBlock())
  
  return blocks
}

// Convert markdown string to Notion blocks using AST parsing
export function markdownToNotionBlocks(markdown: string): NotionBlockRequest[] {
  const tree = processor.parse(markdown) as Root
  return convertASTToNotionBlocks(tree.children)
}

// Convert AST nodes to Notion blocks
function convertASTToNotionBlocks(nodes: Content[]): NotionBlockRequest[] {
  const blocks: NotionBlockRequest[] = []
  
  for (const node of nodes) {
    const converted = convertNodeToNotionBlock(node)
    if (converted) {
      if (Array.isArray(converted)) {
        blocks.push(...converted)
      } else {
        blocks.push(converted)
      }
    }
  }
  
  return blocks
}

// Convert individual AST node to Notion block
function convertNodeToNotionBlock(node: Content): NotionBlockRequest | NotionBlockRequest[] | null {
  switch (node.type) {
    case 'paragraph':
      return convertParagraph(node)
      
    case 'heading':
      return convertHeading(node)
      
    case 'list':
      return convertList(node)
      
    case 'blockquote':
      return convertBlockquote(node)
      
    case 'code':
      return convertCodeBlock(node)
      
    case 'thematicBreak':
      return createDividerBlock()
      
    default:
      return null
  }
}

// Convert paragraph node
function convertParagraph(node: Paragraph): NotionBlockRequest | null {
  const richText = convertInlineNodes(node.children)
  
  // Skip empty paragraphs
  if (richText.length === 0 || richText.every(rt => !rt.text?.content?.trim())) {
    return null
  }
  
  return {
    type: 'paragraph',
    paragraph: { rich_text: richText }
  }
}

// Convert heading node
function convertHeading(node: Heading): NotionBlockRequest {
  const level = Math.min(Math.max(node.depth, 1), 3) as 1 | 2 | 3
  const richText = convertInlineNodes(node.children)
  
  if (level === 1) {
    return {
      type: 'heading_1',
      heading_1: { rich_text: richText }
    }
  } else if (level === 2) {
    return {
      type: 'heading_2',
      heading_2: { rich_text: richText }
    }
  } else {
    return {
      type: 'heading_3',
      heading_3: { rich_text: richText }
    }
  }
}

// Convert list node  
function convertList(node: List): NotionBlockRequest[] {
  return node.children.map((item: ListItem) => {
    const firstChild = item.children[0]
    const richText = firstChild?.type === 'paragraph' 
      ? convertInlineNodes(firstChild.children)
      : [{ type: 'text' as const, text: { content: '' } }]
    
    if (node.ordered) {
      return {
        type: 'numbered_list_item',
        numbered_list_item: { rich_text: richText }
      }
    } else {
      return {
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: richText }
      }
    }
  })
}

// Convert blockquote node
function convertBlockquote(node: BlockContent): NotionBlockRequest {
  const firstChild = 'children' in node ? node.children[0] : null
  const richText = firstChild?.type === 'paragraph' 
    ? convertInlineNodes(firstChild.children)
    : [{ type: 'text' as const, text: { content: 'Quote' } }]
  
  return {
    type: 'quote',
    quote: { rich_text: richText }
  }
}

// Convert code block node
function convertCodeBlock(node: any): NotionBlockRequest {
  return {
    type: 'code',
    code: {
      rich_text: [{
        type: 'text',
        text: { content: node.value || '' }
      }],
      language: node.lang || 'plain text'
    }
  }
}

// Convert inline nodes to Notion rich text
function convertInlineNodes(nodes: PhrasingContent[]): RichTextRequest[] {
  const richText: RichTextRequest[] = []
  
  for (const node of nodes) {
    const converted = convertInlineNode(node)
    if (converted) {
      richText.push(...converted)
    }
  }
  
  return richText
}

// Convert individual inline node
function convertInlineNode(node: PhrasingContent): RichTextRequest[] {
  switch (node.type) {
    case 'text':
      return [{
        type: 'text',
        text: { content: node.value }
      }]
      
    case 'strong':
      return convertInlineNodes(node.children).map(item => ({
        ...item,
        annotations: { 
          ...getDefaultAnnotations(), 
          bold: true 
        }
      }))
      
    case 'emphasis':
      return convertInlineNodes(node.children).map(item => ({
        ...item,
        annotations: { 
          ...getDefaultAnnotations(), 
          italic: true 
        }
      }))
      
    case 'inlineCode':
      return [{
        type: 'text',
        text: { content: node.value },
        annotations: { 
          ...getDefaultAnnotations(), 
          code: true 
        }
      }]
      
    case 'link':
      const linkText = convertInlineNodes(node.children)
      return linkText.map(item => ({
        ...item,
        text: {
          ...item.text,
          link: { url: node.url }
        }
      }))
      
    case 'delete':
      return convertInlineNodes(node.children).map(item => ({
        ...item,
        annotations: { 
          ...getDefaultAnnotations(), 
          strikethrough: true 
        }
      }))
      
    default:
      return []
  }
}

// Utility functions
function getDefaultAnnotations() {
  return {
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    code: false,
    color: 'default' as const
  }
}

// Block creation utilities
function createDividerBlock(): NotionBlockRequest {
  return {
    type: 'divider',
    divider: {}
  }
}

function createHeaderBlock(): NotionBlockRequest {
  return {
    type: 'heading_2',
    heading_2: {
      rich_text: [{
        type: 'text',
        text: { content: 'AI Generated Summary' }
      }]
    }
  }
}

function createTimestampBlock(): NotionBlockRequest {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  return {
    type: 'paragraph',
    paragraph: {
      rich_text: [{
        type: 'text',
        text: { content: `Generated on ${timestamp}` },
        annotations: {
          ...getDefaultAnnotations(),
          italic: true,
          color: 'gray'
        }
      }]
    }
  }
}

// Export utility functions for advanced use cases
export function createCalloutBlock(text: string): NotionBlockRequest {
  return {
    type: 'callout',
    callout: {
      rich_text: [{
        type: 'text',
        text: { content: text }
      }]
    }
  }
}

export function createQuoteBlock(richText: RichTextRequest[]): NotionBlockRequest {
  return {
    type: 'quote',
    quote: { rich_text: richText }
  }
}
