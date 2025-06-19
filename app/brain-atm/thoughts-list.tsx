import { getBrainThoughts } from './utils'
import { renderRichText } from '@/app/components/notion-renderer'

export async function ThoughtsList() {
  const thoughts = await getBrainThoughts()

  if (thoughts.length === 0) {
    return (
      <p className="text-neutral-600 dark:text-neutral-400">
        No thoughts published yet.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {thoughts.map((thought) => (
        <article key={thought.id} className='prose'>
          <p className="text-neutral-900 dark:text-neutral-100 leading-relaxed">
            {renderRichText(thought.thought)}
          </p>
        </article>
      ))}
    </div>
  )
} 