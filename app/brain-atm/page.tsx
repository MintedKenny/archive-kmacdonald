import { ThoughtsList } from './thoughts-list'

export default function BrainAtmPage() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Brain currently
      </h1>
      <p className="mb-8 text-sm text-neutral-600 dark:text-neutral-400">
        Stream of consciousness.
      </p>
      <div className='mb-8'>
        <ThoughtsList />
      </div>
    </section>
  )
} 