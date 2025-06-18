import { AllPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Kenneth MacDonald
      </h1>
      <p className="mb-4">
        {`Description`}
      </p>
      
      <div className="my-8">
        <h2 className="mb-4 text-xl font-semibold tracking-tighter">
          Posts
        </h2>
        <AllPosts />
      </div>
    </section>
  )
}
