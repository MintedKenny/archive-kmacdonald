import { QuestionsList } from './questions-list'

export default function OpenQuestionsPage() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Open questions
      </h1>
      <p className="mb-8 text-sm text-neutral-600 dark:text-neutral-400">
        Comment if you'd like!
      </p>
      <div className='mb-8'>
        <QuestionsList />
      </div>
    </section>
  )
} 