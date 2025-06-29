import { getPageBlocks, enrichBlocksWithChildren } from '@/lib/notion/notion-client'

export async function getLinksPageContent() {
  if (!process.env.NOTION_PAGE_ID_LINKS) {
    return []
  }

  try {
    const blocks = await getPageBlocks(process.env.NOTION_PAGE_ID_LINKS)
    const enrichedBlocks = await enrichBlocksWithChildren(blocks)
    return enrichedBlocks
  } catch (error) {
    console.error('Error fetching links page:', error)
    return []
  }
} 