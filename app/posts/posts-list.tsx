'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate } from './utils'
import { tagDescriptions } from './tag-descriptions'

interface Post {
  metadata: {
    title: string
    publishedAt: string
    summary: string
    tags: string[]
  }
  slug: string
}

interface PostsListProps {
  initialPosts: Post[]
  selectedTag?: string
  enableClientFiltering?: boolean
}

export default function PostsList({ 
  initialPosts, 
  selectedTag: initialSelectedTag,
  enableClientFiltering = false 
}: PostsListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(initialSelectedTag || null)
  
  // Get all unique tags
  const allTags = Array.from(new Set(initialPosts.flatMap(post => post.metadata.tags))).sort()
  
  // Filter posts by selected tag
  const filteredPosts = selectedTag 
    ? initialPosts.filter(post => post.metadata.tags.includes(selectedTag))
    : initialPosts

  const sortedPosts = filteredPosts.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1
    }
    return 1
  })

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
                !selectedTag
                  ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              All ({initialPosts.length})
            </Link>
            {allTags.map((tagName) => {
              const count = initialPosts.filter(post => post.metadata.tags.includes(tagName)).length
              return (
                <Link
                  key={tagName}
                  href={`/posts/tag/${encodeURIComponent(tagName)}`}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedTag === tagName
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

      {/* Tag Description */}
      {selectedTag && tagDescriptions[selectedTag] && (
        <p className="mb-8 text-sm text-neutral-600 dark:text-neutral-400">
          {tagDescriptions[selectedTag]}
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
              {!selectedTag && post.metadata.tags.length > 0 && (
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