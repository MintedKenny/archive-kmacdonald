import { getPosts } from '../../utils'
import PostsList from '../../posts-list'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const posts = await getPosts()
  const tags = Array.from(new Set(posts.flatMap(post => post.metadata.tags)))
  
  return tags.map(tag => ({ tag: encodeURIComponent(tag) }))
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  
  return {
    title: `Posts`,
    description: `All posts tagged with ${decodedTag}`,
  }
}

interface TagPageProps {
  params: Promise<{ tag: string }>
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const posts = await getPosts()
  
  // Check if tag exists
  const allTags = Array.from(new Set(posts.flatMap(post => post.metadata.tags)))
  if (!allTags.includes(decodedTag)) {
    notFound()
  }
  
  return <PostsList initialPosts={posts} selectedTag={decodedTag} />
} 