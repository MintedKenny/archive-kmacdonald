import { getLinksPageContent } from './utils'
import { NotionRenderer } from 'app/components/notion-renderer'

export async function LinksContent() {
  const blocks = await getLinksPageContent()

  if (blocks.length === 0) {
    return (
      <p className="text-neutral-600 dark:text-neutral-400">
        No links content available.
      </p>
    )
  }

  return <NotionRenderer blocks={blocks} />
} 