import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
}

type BlogPost = {
  metadata: Metadata
  slug: string
  content: string
}

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const n2m = new NotionToMarkdown({ notionClient: notion })

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

        // Get page content and convert to markdown
        const mdblocks = await n2m.pageToMarkdown(page.id)
        const mdString = n2m.toMarkdownString(mdblocks)
        const content = mdString.parent || ''

        return {
          metadata,
          slug,
          content,
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