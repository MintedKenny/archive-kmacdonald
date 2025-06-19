import { queryNotionDatabase } from '@/lib/notion-client'

export interface BrainThought {
  id: string
  thought: any[] // Rich text array from Notion
  publishedAt: string
}

export async function getBrainThoughts(): Promise<BrainThought[]> {
  if (!process.env.NOTION_DATABASE_ID_BRAIN) {
    return []
  }

  const results = await queryNotionDatabase(
    process.env.NOTION_DATABASE_ID_BRAIN,
    {
      property: 'Published',
      checkbox: { equals: true }
    },
    [{ property: 'Created time', direction: 'descending' }]
  )

  return results.map((page: any) => ({
    id: page.id,
    thought: page.properties.Thought?.title || page.properties.Thought?.rich_text || [],
    publishedAt: page.properties['Created time']?.created_time || new Date().toISOString(),
  }))
} 