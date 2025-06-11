import Link from 'next/link'
import { getFieldNotes, formatDate } from './utils'

export const metadata = {
  title: 'Field Notes',
  description: 'Read my field notes.',
}

export default async function FieldNotesPage() {
  const allFieldNotes = await getFieldNotes()

  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Field notes
      </h1>
      {allFieldNotes
        .sort((a, b) => {
          if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
            return -1
          }
          return 1
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="flex flex-col space-y-1 mb-4"
            href={`/field-notes/${post.slug}`}
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
    </section>
  )
} 