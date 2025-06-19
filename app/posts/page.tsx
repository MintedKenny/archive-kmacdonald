import { getPosts } from './utils'
import PostsList from './posts-list'

export const metadata = {
  title: 'Posts',
  description: 'Read my blog posts and field notes.',
}

export default async function PostsPage() {
  const posts = await getPosts()
  
  return <PostsList initialPosts={posts} />
} 