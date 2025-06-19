import { LinksContent } from './links-content'

export const metadata = {
  title: 'Links',
  description: 'Cool products and useful resources.',
}

export default function LinksPage() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Links
      </h1>
      <p className="mb-8 text-neutral-600 dark:text-neutral-400">
        Current repository.
      </p>
      
      <article className="prose">
        <LinksContent />
      </article>
    </section>
  )
} 