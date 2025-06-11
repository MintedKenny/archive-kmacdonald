import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { getFieldNotes } from 'app/field-notes/utils'

type PostWithType = {
  slug: string
  metadata: {
    title: string
    publishedAt: string
    summary: string
    image?: string
  }
  type: 'blog' | 'field-notes'
  href: string
}

export async function BlogPosts() {
  let allBlogs = await getBlogPosts()

  return (
    <div>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="flex flex-col space-y-1 mb-4"
            href={`/blog/${post.slug}`}
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

export async function FieldNotePosts() {
  let allFieldNotes = await getFieldNotes()

  return (
    <div>
      {allFieldNotes
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((note) => (
          <Link
            key={note.slug}
            className="flex flex-col space-y-1 mb-4"
            href={`/field-notes/${note.slug}`}
          >
            <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2 md:items-start">
              <p className="text-neutral-600 dark:text-neutral-400 w-[120px] tabular-nums text-sm flex-shrink-0">
                {formatDate(note.metadata.publishedAt, false)}
              </p>
              <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                {note.metadata.title}
              </p>
            </div>
          </Link>
        ))}
    </div>
  )
}

export async function AllPosts() {
  const [blogPosts, fieldNotes] = await Promise.all([
    getBlogPosts(),
    getFieldNotes()
  ])

  const allPosts: PostWithType[] = [
    ...blogPosts.map(post => ({
      ...post,
      type: 'blog' as const,
      href: `/blog/${post.slug}`
    })),
    ...fieldNotes.map(note => ({
      ...note,
      type: 'field-notes' as const,
      href: `/field-notes/${note.slug}`
    }))
  ]

  // Sort all posts by date
  const sortedPosts = allPosts.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime()
  })

  return (
    <div>
      {sortedPosts.map((post) => (
        <Link
          key={`${post.type}-${post.slug}`}
          className="flex flex-col space-y-1 mb-4"
          href={post.href}
        >
          <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2 md:items-start">
            <p className="text-neutral-600 dark:text-neutral-400 w-[120px] tabular-nums text-sm flex-shrink-0">
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <p className="text-neutral-900 dark:text-neutral-100 tracking-tight flex-grow">
              {post.metadata.title}
            </p>
            <span className="text-neutral-500 dark:text-neutral-500 text-xs uppercase tracking-wide w-[80px] text-right flex-shrink-0">
              {post.type === 'blog' ? 'blog' : 'field notes'}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
