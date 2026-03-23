'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CreateFlavorPayload } from '@/lib/types'
import { cn } from '@/lib/cn'

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
  const [shaking, setShaking] = useState(false)

  const isEditing = Boolean(flavorId)

  const triggerShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 400)
  }

  const inputClass = cn(
    'w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700',
    'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400',
    'text-sm transition-shadow'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug.trim()) {
      setError('Slug is required')
      triggerShake()
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
      toast.success(isEditing ? 'Flavor updated' : 'Flavor created')

      if (onSuccess) {
        onSuccess()
      } else if (!isEditing && data.data?.id) {
        router.push(`/flavors/${data.data.id}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-4', shaking && 'animate-shake')}
    >
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
          className={inputClass}
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
          className={cn(inputClass, 'resize-none')}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : isEditing ? 'Save Changes' : 'Create Flavor'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
