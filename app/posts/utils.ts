import { getNotionPosts, getNotionFieldNotes } from '@/lib/notion-renderer'

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
}

export async function getPosts() {
  // Get both blog posts and field notes from Notion CMS
  const [notionPosts, notionFieldNotes] = await Promise.all([
    getNotionPosts(),
    getNotionFieldNotes()
  ])
  
  // Combine and sort by date
  const allPosts = [...notionPosts, ...notionFieldNotes]
  
  return allPosts.sort((a, b) => 
    new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime()
  )
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
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
} 