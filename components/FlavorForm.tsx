'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateFlavorPayload } from '@/lib/types'

interface FlavorFormProps {
  initialValues?: {
    slug: string
    description: string
  }
  flavorId?: number
  onCancel?: () => void
  onSuccess?: () => void
}

export function FlavorForm({
  initialValues,
  flavorId,
  onCancel,
  onSuccess,
}: FlavorFormProps) {
  const router = useRouter()
  const [slug, setSlug] = useState(initialValues?.slug ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = Boolean(flavorId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug.trim()) {
      setError('Slug is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const payload: CreateFlavorPayload = {
        slug: slug.trim(),
        description: description.trim(),
      }

      const url = isEditing ? `/api/flavors/${flavorId}` : '/api/flavors'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Failed to save flavor')
      }

      const data = await response.json()

      if (onSuccess) {
        onSuccess()
      } else if (!isEditing && data.data?.id) {
        router.push(`/flavors/${data.data.id}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. dry-wit, slapstick"
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this humor flavor..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 text-sm resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Flavor'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
