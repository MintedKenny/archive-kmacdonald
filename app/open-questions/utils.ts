import { queryNotionDatabase } from '@/lib/notion-client'

export interface OpenQuestion {
  id: string
  title: any[] // Rich text array from Notion
  tags: string[] // Multi-select tags from Notion
  publishedAt: string
}

export interface QuestionComment {
  id: string
  content: any[] // Rich text array from Notion
  authorName: string
  createdAt: string
  questionId: string
}

export async function getOpenQuestions(): Promise<OpenQuestion[]> {
  if (!process.env.NOTION_DATABASE_ID_QUESTIONS) {
    return []
  }

  const results = await queryNotionDatabase(
    process.env.NOTION_DATABASE_ID_QUESTIONS,
    {
      property: 'Published',
      checkbox: { equals: true }
    },
    [{ property: 'Created time', direction: 'descending' }]
  )

  return results.map((page: any) => ({
    id: page.id,
    title: page.properties.Question?.title || page.properties.Question?.rich_text || [],
    tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
    publishedAt: page.properties['Created time']?.created_time || new Date().toISOString(),
  }))
}

export async function getQuestionComments(questionId: string): Promise<QuestionComment[]> {
  if (!process.env.NOTION_DATABASE_ID_COMMENTS) {
    return []
  }

  const results = await queryNotionDatabase(
    process.env.NOTION_DATABASE_ID_COMMENTS,
    {
      and: [
        {
          property: 'Question',
          relation: { contains: questionId }
        },
        {
          property: 'Published',
          checkbox: { equals: true }
        }
      ]
    },
    [{ property: 'Created time', direction: 'ascending' }]
  )

  return results.map((page: any) => ({
    id: page.id,
    content: page.properties.Comment?.title || [],
    authorName: page.properties.Name?.rich_text?.[0]?.plain_text || 'Anonymous',
    createdAt: page.properties['Created time']?.created_time || new Date().toISOString(),
    questionId: questionId,
  }))
} 