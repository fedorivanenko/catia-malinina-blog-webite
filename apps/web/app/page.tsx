import { EmailSignup } from 'app/components/email-signup'
import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Catia Malinina
      </h1>
      <p className="mb-4">
        {`Building the best preconception protocol ever. N=1`}
      </p>
      <p className="mb-4 text-neutral-600 dark:text-neutral-400">
        Get the fertility and pregnancy studies actually worth knowing about,
        translated into plain English and what they mean for you.
      </p>
      <EmailSignup />
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
