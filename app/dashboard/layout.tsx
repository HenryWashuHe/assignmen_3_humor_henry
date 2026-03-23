import { createClient } from '@/lib/supabase-server'
import { Sidebar } from '@/components/Sidebar'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, is_superadmin, is_matrix_admin, first_name, last_name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
