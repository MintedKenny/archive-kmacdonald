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
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      ...(filter && { filter }),
      ...(sorts && { sorts }),
    })
    return response.results
  } catch (error) {
    console.error('Error querying Notion database:', error)
    return []
  }
}

// Get blocks for any page
export async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
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
export async function enrichBlocksWithChildren(blocks: NotionBlock[]): Promise<NotionBlock[]> {
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