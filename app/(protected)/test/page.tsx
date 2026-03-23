import { createClient } from '@/lib/supabase-server'
import { AnimatedPage } from '@/components/AnimatedPage'
import { TestFlavorClient } from './TestFlavorClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ flavor?: string }>
}

export default async function TestPage({ searchParams }: PageProps) {
  const { flavor: flavorParam } = await searchParams
  const supabase = await createClient()

  const [{ data: flavors }, { data: imageSets }] = await Promise.all([
    supabase.from('humor_flavors').select('id, slug').order('slug'),
    supabase.from('study_image_sets').select('id, slug, description').order('slug'),
  ])

  return (
    <AnimatedPage>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Test Flavor</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 ml-13">
            Generate captions by running an image through a humor flavor pipeline
          </p>
        </div>

        <TestFlavorClient
          flavors={flavors ?? []}
          imageSets={imageSets ?? []}
          initialFlavorId={flavorParam}
        />
      </div>
    </AnimatedPage>
  )
}
