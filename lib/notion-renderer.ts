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

async function getNotionContentByCategory(category: string): Promise<BlogPost[]> {
  if (!process.env.NOTION_DATABASE_ID) {
    return []
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        and: [
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
          {
            property: 'Category',
            select: {
              equals: category,
            },
          },
        ],
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
        }

        const slug = page.properties.Slug.rich_text[0]?.plain_text || 
                     metadata.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

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
    console.error(`Error fetching Notion ${category} posts:`, error)
    return []
  }
}

export async function getNotionPosts(): Promise<BlogPost[]> {
  return getNotionContentByCategory('Blog')
}

export async function getNotionFieldNotes(): Promise<BlogPost[]> {
  return getNotionContentByCategory('Field notes')
}

export async function getNotionPost(slug: string): Promise<BlogPost | null> {
  const posts = await getNotionPosts()
  return posts.find(post => post.slug === slug) || null
}

export async function getNotionFieldNote(slug: string): Promise<BlogPost | null> {
  const fieldNotes = await getNotionFieldNotes()
  return fieldNotes.find(note => note.slug === slug) || null
} 