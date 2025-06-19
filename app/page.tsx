import { AllPosts } from 'app/components/posts'
import { ArrowIcon } from 'app/components/arrow-icon'

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
          href="/links"
        >
          <ArrowIcon />
          <p className="ml-2 h-7">links</p>
        </a>
      </div>
      
      <div className="my-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tighter">
          Posts
        </h2>
        <AllPosts />
      </div>
    </section>
  )
}
