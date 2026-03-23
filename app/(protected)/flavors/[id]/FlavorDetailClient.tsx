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
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {flavor.slug}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    ID: {flavor.id}
                  </span>
                </div>
                {flavor.description && (
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">{flavor.description}</p>
                )}
                {flavor.created_datetime_utc && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                    Created {new Date(flavor.created_datetime_utc).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Tooltip content="Test this flavor">
                  <Link
                    href={`/test?flavor=${flavor.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors active:scale-[0.97]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Test
                  </Link>
                </Tooltip>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-[0.97]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => setIsDeleting(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors active:scale-[0.97]"
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
