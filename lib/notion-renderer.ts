import { Client } from '@notionhq/client'
import { ReactNode } from 'react'

export interface NotionBlock {
  id: string
  type: string
  has_children: boolean
  [key: string]: any
}

export interface BlogPost {
  metadata: {
    title: string
    publishedAt: string
    summary: string
    image?: string
    tags: string[]
  }
  slug: string
  blocks: NotionBlock[]
}

const notion = new Client({
  auth: process.env.NOTION_TOKEN!,
})

// Get blocks directly instead of converting to markdown
async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = []
  let cursor: string | undefined
  
  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      ...(cursor && { start_cursor: cursor }),
      page_size: 100,
    })
    
    blocks.push(...response.results as NotionBlock[])
    cursor = response.next_cursor || undefined
  } while (cursor)
  
  return blocks
}

// Recursively get children for blocks that have them
async function enrichBlocksWithChildren(blocks: NotionBlock[]): Promise<NotionBlock[]> {
  const enrichedBlocks = await Promise.all(
    blocks.map(async (block) => {
      if (block.has_children) {
        const children = await getPageBlocks(block.id)
        const enrichedChildren = await enrichBlocksWithChildren(children)
        return { ...block, children: enrichedChildren }
      }
      return block
    })
  )
  
  return enrichedBlocks
}

// Get all posts regardless of category
export async function getAllNotionPosts(): Promise<BlogPost[]> {
  if (!process.env.NOTION_DATABASE_ID) {
    return []
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    })

    const posts = await Promise.all(
      response.results.map(async (page: any) => {
        const metadata = {
          title: page.properties.Name.title[0]?.plain_text || 'Untitled',
          publishedAt: page.properties.Date.date?.start || new Date().toISOString(),
          summary: page.properties.Summary.rich_text[0]?.plain_text || '',
          tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
        }

        const slug = metadata.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

        // Get page blocks directly instead of converting to markdown
        const blocks = await getPageBlocks(page.id)
        const enrichedBlocks = await enrichBlocksWithChildren(blocks)

        return {
          metadata,
          slug,
          blocks: enrichedBlocks,
        }
      })
    )

    return posts
  } catch (error) {
    console.error('Error fetching Notion posts:', error)
    return []
  }
}

// Get a single post by slug
export async function getNotionPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllNotionPosts()
  return posts.find(post => post.slug === slug) || null
} 