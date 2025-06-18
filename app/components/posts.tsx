import Link from 'next/link'
import { formatDate, getPosts } from 'app/posts/utils'

export async function AllPosts() {
  const allPosts = await getPosts()

  return (
    <div>
      {allPosts.map((post) => (
        <Link
          key={post.slug}
          className="flex flex-col space-y-1 mb-4"
          href={`/posts/${post.slug}`}
        >
          <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2 md:items-start">
            <p className="text-neutral-600 dark:text-neutral-400 w-[120px] tabular-nums text-sm flex-shrink-0">
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
              {post.metadata.title}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
