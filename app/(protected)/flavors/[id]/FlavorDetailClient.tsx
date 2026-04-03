'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { HumorFlavor } from '@/lib/types'
import { FlavorForm } from '@/components/FlavorForm'
import { DeleteConfirm } from '@/components/DeleteConfirm'
import { Tooltip } from '@/components/Tooltip'

interface FlavorDetailClientProps {
  flavor: HumorFlavor
}

export function FlavorDetailClient({ flavor }: FlavorDetailClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  const handleDeleteConfirm = async () => {
    const response = await fetch(`/api/flavors/${flavor.id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error ?? 'Delete failed')
    }
    toast.success('Flavor deleted')
    router.push('/flavors')
    router.refresh()
  }

  const handleDuplicate = async () => {
    try {
      setIsDuplicating(true)
      const response = await fetch(`/api/flavors/${flavor.id}/duplicate`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Duplicate failed')
      }

      const data = await response.json()
      toast.success('Flavor duplicated')

      if (data.data?.id) {
        router.push(`/flavors/${data.data.id}`)
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Duplicate failed')
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-0"
          >
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Edit Flavor</h2>
            <FlavorForm
              flavorId={flavor.id}
              initialValues={{ slug: flavor.slug, description: flavor.description ?? '' }}
              onSuccess={() => {
                setIsEditing(false)
                toast.success('Flavor updated')
                router.refresh()
              }}
              onCancel={() => setIsEditing(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="glass-surface rounded-[28px] p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="truncate text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                    {flavor.slug}
                  </h1>
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    ID: {flavor.id}
                  </span>
                </div>
                {flavor.description && (
                  <p className="max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{flavor.description}</p>
                )}
                {flavor.created_datetime_utc && (
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                    Created {new Date(flavor.created_datetime_utc).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Tooltip content="Test this flavor">
                  <Link
                    href={`/test?flavor=${flavor.id}`}
                    className="flex items-center gap-2 rounded-xl border border-sky-300 px-3 py-2 text-sm font-medium text-sky-700 transition-colors active:scale-[0.97] hover:bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-950/40"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Test
                  </Link>
                </Tooltip>
                <Tooltip content="Duplicate this flavor and all of its steps">
                  <button
                    onClick={handleDuplicate}
                    disabled={isDuplicating}
                    className="flex items-center gap-2 rounded-xl border border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors active:scale-[0.97] disabled:opacity-60 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H7a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1M8 7V6a2 2 0 012-2h7a2 2 0 012 2v7a2 2 0 01-2 2h-1M8 7h8a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2V9a2 2 0 012-2z" />
                    </svg>
                    {isDuplicating ? 'Duplicating...' : 'Duplicate'}
                  </button>
                </Tooltip>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors active:scale-[0.97] hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => setIsDeleting(true)}
                  className="flex items-center gap-2 rounded-xl border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition-colors active:scale-[0.97] hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleting && (
          <DeleteConfirm
            label={flavor.slug}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setIsDeleting(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
