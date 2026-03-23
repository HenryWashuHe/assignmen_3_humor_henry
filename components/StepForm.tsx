'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { HumorFlavorStep, LlmModel, LlmInputType, LlmOutputType, HumorFlavorStepType, CreateStepPayload } from '@/lib/types'
import { cn } from '@/lib/cn'

interface StepFormProps {
  flavorId: number
  step?: HumorFlavorStep
  models: LlmModel[]
  inputTypes: LlmInputType[]
  outputTypes: LlmOutputType[]
  stepTypes: HumorFlavorStepType[]
  onSuccess: () => void
  onCancel: () => void
}

export function StepForm({
  flavorId,
  step,
  models,
  inputTypes,
  outputTypes,
  stepTypes,
  onSuccess,
  onCancel,
}: StepFormProps) {
  const [description, setDescription] = useState(step?.description ?? '')
  const [systemPrompt, setSystemPrompt] = useState(step?.llm_system_prompt ?? '')
  const [userPrompt, setUserPrompt] = useState(step?.llm_user_prompt ?? '')
  const [modelId, setModelId] = useState<string>(String(step?.llm_model_id ?? models[0]?.id ?? ''))
  const [temperature, setTemperature] = useState<string>(String(step?.llm_temperature ?? '0.7'))
  const [inputTypeId, setInputTypeId] = useState<string>(String(step?.llm_input_type_id ?? inputTypes[0]?.id ?? ''))
  const [outputTypeId, setOutputTypeId] = useState<string>(String(step?.llm_output_type_id ?? outputTypes[0]?.id ?? ''))
  const [stepTypeId, setStepTypeId] = useState<string>(String(step?.humor_flavor_step_type_id ?? stepTypes[0]?.id ?? ''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shaking, setShaking] = useState(false)

  const selectedModel = models.find((m) => String(m.id) === modelId)
  const isTemperatureSupported = selectedModel?.is_temperature_supported ?? false

  const isEditing = Boolean(step?.id)

  const triggerShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 400)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modelId || !inputTypeId || !outputTypeId || !stepTypeId) {
      setError('All select fields are required')
      triggerShake()
      return
    }

    try {
      setLoading(true)
      setError(null)

      const payload: CreateStepPayload = {
        description: description.trim(),
        llm_system_prompt: systemPrompt.trim(),
        llm_user_prompt: userPrompt.trim(),
        llm_model_id: Number(modelId),
        llm_temperature: isTemperatureSupported ? Number(temperature) : null,
        llm_input_type_id: Number(inputTypeId),
        llm_output_type_id: Number(outputTypeId),
        humor_flavor_step_type_id: Number(stepTypeId),
      }

      const url = isEditing
        ? `/api/flavors/${flavorId}/steps/${step!.id}`
        : `/api/flavors/${flavorId}/steps`
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Failed to save step')
      }

      toast.success(isEditing ? 'Step updated' : 'Step created')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  const inputClass = cn(
    'w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700',
    'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400',
    'text-sm transition-shadow'
  )

  const promptClass = cn(
    inputClass,
    'font-mono text-xs bg-zinc-50 dark:bg-zinc-900/80 resize-y',
    'placeholder-zinc-400 dark:placeholder-zinc-600'
  )

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
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this step"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Model <span className="text-red-500">*</span>
          </label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select model...</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {isTemperatureSupported && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Temperature (0–2)
            </label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className={inputClass}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Input Type <span className="text-red-500">*</span>
          </label>
          <select
            value={inputTypeId}
            onChange={(e) => setInputTypeId(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select...</option>
            {inputTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.description}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Output Type <span className="text-red-500">*</span>
          </label>
          <select
            value={outputTypeId}
            onChange={(e) => setOutputTypeId(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select...</option>
            {outputTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.description}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Step Type <span className="text-red-500">*</span>
          </label>
          <select
            value={stepTypeId}
            onChange={(e) => setStepTypeId(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select...</option>
            {stepTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.description ?? t.slug}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          System Prompt
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="System-level instructions for the LLM..."
          rows={4}
          className={promptClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          User Prompt
        </label>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="User-facing prompt template..."
          rows={4}
          className={promptClass}
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
          ) : isEditing ? 'Save Changes' : 'Add Step'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
