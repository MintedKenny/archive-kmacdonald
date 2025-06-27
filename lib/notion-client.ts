import { Client } from '@notionhq/client'

export interface NotionBlock {
  id: string
  type: string
  has_children: boolean
  [key: string]: any
}

const notion = new Client({
  auth: process.env.NOTION_TOKEN!,
})

// Generic function to query any Notion database
export async function queryNotionDatabase(
  databaseId: string,
  filter?: any,
  sorts?: any[]
) {
  if (!databaseId) {
    throw new Error('Database ID is required')
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      ...(filter && { filter }),
      ...(sorts && { sorts }),
    })
    return response.results
  } catch (error) {
    console.error('Error querying Notion database:', error)
    throw new Error(`Failed to query database: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Create a new page in a Notion database
export async function createNotionPage(
  databaseId: string,
  properties: any
) {
  if (!databaseId) {
    throw new Error('Database ID is required')
  }

  if (!properties) {
    throw new Error('Page properties are required')
  }

  try {
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties,
    })
    return response
  } catch (error) {
    console.error('Error creating Notion page:', error)
    throw new Error(`Failed to create page: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get blocks for any page
export async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
  if (!pageId) {
    throw new Error('Page ID is required')
  }

  const blocks: NotionBlock[] = []
  let cursor: string | undefined
  
  try {
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
  } catch (error) {
    console.error('Error fetching page blocks:', error)
    throw new Error(`Failed to fetch page blocks: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Recursively get children for blocks that have them
export async function enrichBlocksWithChildren(blocks: NotionBlock[]): Promise<NotionBlock[]> {
  try {
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
  } catch (error) {
    console.error('Error enriching blocks with children:', error)
    throw new Error(`Failed to enrich blocks: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 