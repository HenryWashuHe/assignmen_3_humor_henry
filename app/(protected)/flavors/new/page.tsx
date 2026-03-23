import { FlavorForm } from '@/components/FlavorForm'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { AnimatedPage } from '@/components/AnimatedPage'

export default function NewFlavorPage() {
  return (
    <AnimatedPage>
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <Breadcrumbs items={[{ label: 'Flavors', href: '/flavors' }, { label: 'New Flavor' }]} />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">New Humor Flavor</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Create a new humor flavor with a unique slug
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <FlavorForm />
        </div>
      </div>
    </AnimatedPage>
  )
}
