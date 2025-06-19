import { getPosts } from './utils'
import PostsPage from './page'

export const metadata = {
  title: 'Posts',
  description: 'Read my blog posts and field notes.',
}

export default async function PostsLayout() {
  const posts = await getPosts()
  
  return <PostsPage initialPosts={posts} />
} 