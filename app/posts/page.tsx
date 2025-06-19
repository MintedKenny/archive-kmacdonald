import Link from 'next/link'
import { getPosts, formatDate } from './utils'
import { tagDescriptions } from './tag-descriptions'

export const metadata = {
  title: 'Posts',
  description: 'Read my blog posts and field notes.',
}

interface PostsPageProps {
  searchParams: Promise<{ tag?: string }>
}

// Force this page to use ISR despite searchParams
export const revalidate = 3600

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { tag } = await searchParams
  const allPosts = await getPosts()
  
  // Get all unique tags
  const allTags = Array.from(new Set(allPosts.flatMap(post => post.metadata.tags))).sort()
  
  // Filter posts by tag if specified
  const filteredPosts = tag 
    ? allPosts.filter(post => post.metadata.tags.includes(tag))
    : allPosts

  const sortedPosts = filteredPosts.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1
    }
    return 1
  })

  // Get description for selected tag
  const tagDescription = tag ? tagDescriptions[tag] : undefined

  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Posts
      </h1>
      
      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/posts"
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                !tag
                  ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              All ({allPosts.length})
            </Link>
            {allTags.map((tagName) => {
              const count = allPosts.filter(post => post.metadata.tags.includes(tagName)).length
              return (
                <Link
                  key={tagName}
                  href={`/posts?tag=${encodeURIComponent(tagName)}`}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    tag === tagName
                      ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {tagName} ({count})
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Tag Description - moved after filters */}
      {tagDescription && (
        <p className="mb-8 text-neutral-600 dark:text-neutral-400">
          {tagDescription}
        </p>
      )}

      {/* Posts List */}
      {sortedPosts.map((post) => (
        <Link
          key={post.slug}
          className="flex flex-col space-y-1 mb-4"
          href={`/posts/${post.slug}`}
        >
          <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2 md:items-start">
            <p className="text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums text-sm flex-shrink-0">
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <div className="flex-1 flex items-start justify-between">
              <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                {post.metadata.title}
              </p>
              {/* Only show tags when not filtering by a specific tag */}
              {!tag && post.metadata.tags.length > 0 && (
                <div className="flex gap-1 ml-4 flex-shrink-0">
                  {post.metadata.tags.map((tagName) => (
                    <span
                      key={tagName}
                      className="text-xs px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    >
                      {tagName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </section>
  )
} 