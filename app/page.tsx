import { AllPosts } from 'app/components/posts'
import { ArrowIcon } from 'app/components/arrow-icon'
import { ListFilter } from 'lucide-react'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Kenneth MacDonald
      </h1>
      <p className="mb-4">
        {`Ongoing archive. Field notes and maybe the occasional blog post. 
        Nothing nuanced said. All from a founder with no company.`}
      </p>
      
      <div className="mb-8 flex flex-row space-x-4 text-neutral-600 dark:text-neutral-300">
        <a
          className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
          href="/brain-atm"
        >
          <ArrowIcon />
          <p className="ml-2 h-7">brain atm</p>
        </a>
        <a
          className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
          href="/open-questions"
        >
          <ArrowIcon />
          <p className="ml-2 h-7">questions</p>
        </a>
        <a
          className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
          href="/links"
        >
          <ArrowIcon />
          <p className="ml-2 h-7">links</p>
        </a>
      </div>
      
      <div className="my-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tighter">
            Posts
          </h2>
          <a
            className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100 text-neutral-600 dark:text-neutral-300 text-sm"
            href="/posts"
          >
            <ListFilter size={12} />
            <p className="ml-2 h-5">by tag</p>
          </a>
        </div>
        <AllPosts />
      </div>
    </section>
  )
}
