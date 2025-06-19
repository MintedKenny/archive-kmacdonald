import { queryNotionDatabase, getPageBlocks, enrichBlocksWithChildren } from '@/lib/notion-client'

export interface BlogPost {
  metadata: {
    title: string
    publishedAt: string
    summary: string
    image?: string
    tags: string[]
  }
  slug: string
  blocks: any[]
}

export async function getPosts(): Promise<BlogPost[]> {
  if (!process.env.NOTION_DATABASE_ID_POSTS) {
    return []
  }

  const results = await queryNotionDatabase(
    process.env.NOTION_DATABASE_ID_POSTS,
    {
      property: 'Published',
      checkbox: { equals: true }
    },
    [{ property: 'Date', direction: 'descending' }]
  )

  const posts = await Promise.all(
    results.map(async (page: any) => {
      const metadata = {
        title: page.properties.Name.title[0]?.plain_text || 'Untitled',
        publishedAt: page.properties.Date.date?.start || new Date().toISOString(),
        summary: page.properties.Summary.rich_text[0]?.plain_text || '',
        tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
      }

      const slug = metadata.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const blocks = await getPageBlocks(page.id)
      const enrichedBlocks = await enrichBlocksWithChildren(blocks)

      return { metadata, slug, blocks: enrichedBlocks }
    })
  )

  return posts
}

export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date)

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  let daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
} 