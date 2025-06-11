import { getBlogPosts } from 'app/blog/utils'
import { getFieldNotes } from 'app/field-notes/utils'

export const baseUrl = 'https://portfolio-blog-starter.vercel.app'

export default async function sitemap() {
  let blogs = (await getBlogPosts()).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let fieldNotes = (await getFieldNotes()).map((note) => ({
    url: `${baseUrl}/field-notes/${note.slug}`,
    lastModified: note.metadata.publishedAt,
  }))

  let routes = ['', '/blog', '/field-notes'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs, ...fieldNotes]
}
