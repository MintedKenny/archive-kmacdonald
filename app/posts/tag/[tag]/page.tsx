import { getPosts } from '../../utils'
import PostsList from '../../posts-list'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const posts = await getPosts()
  const tags = Array.from(new Set(posts.flatMap(post => post.metadata.tags)))
  
  // Don't encode here - let Next.js handle it
  return tags.map(tag => ({ tag }))
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  
  return {
    title: `Posts tagged "${tag}"`,
    description: `All posts tagged with ${tag}`,
  }
}

interface TagPageProps {
  params: Promise<{ tag: string }>
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const posts = await getPosts()
  
  // Check if tag exists
  const allTags = Array.from(new Set(posts.flatMap(post => post.metadata.tags)))
  if (!allTags.includes(tag)) {
    notFound()
  }
  
  return <PostsList initialPosts={posts} selectedTag={tag} />
} 