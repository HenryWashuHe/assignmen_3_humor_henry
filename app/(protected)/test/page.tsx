import { createClient } from '@/lib/supabase-server'
import { TestFlavorClient } from './TestFlavorClient'

export const dynamic = 'force-dynamic'

export default async function TestPage() {
  const supabase = await createClient()

  const [{ data: flavors }, { data: imageSets }] = await Promise.all([
    supabase.from('humor_flavors').select('id, slug').order('slug'),
    supabase.from('study_image_sets').select('id, slug, description').order('slug'),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Test Flavor</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Generate captions by running an image through a humor flavor pipeline
        </p>
      </div>

      <TestFlavorClient
        flavors={flavors ?? []}
        imageSets={imageSets ?? []}
      />
    </div>
  )
}
