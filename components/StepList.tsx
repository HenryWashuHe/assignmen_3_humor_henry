'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { HumorFlavorStep, LlmModel, LlmInputType, LlmOutputType, HumorFlavorStepType } from '@/lib/types'
import { StepForm } from './StepForm'
import { DeleteConfirm } from './DeleteConfirm'
import { Tooltip } from './Tooltip'
import { cn } from '@/lib/cn'

interface StepItemContentProps {
  step: HumorFlavorStep
  models: LlmModel[]
  inputTypes: LlmInputType[]
  outputTypes: LlmOutputType[]
  stepTypes: HumorFlavorStepType[]
  onEdit: (step: HumorFlavorStep) => void
  onDelete: (step: HumorFlavorStep) => void
  isDragging?: boolean
  dragHandleProps?: Record<string, unknown>
}

function StepItemContent({
  step,
  models,
  inputTypes,
  outputTypes,
  stepTypes,
  onEdit,
  onDelete,
  isDragging = false,
  dragHandleProps,
}: StepItemContentProps) {
  const [expanded, setExpanded] = useState(false)
  const modelName = models.find((m) => m.id === step.llm_model_id)?.name ?? '—'
  const inputType = inputTypes.find((t) => t.id === step.llm_input_type_id)?.slug ?? '—'
  const outputType = outputTypes.find((t) => t.id === step.llm_output_type_id)?.slug ?? '—'
  const stepType = stepTypes.find((t) => t.id === step.humor_flavor_step_type_id)?.slug ?? '—'

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-shadow',
        isDragging && 'shadow-2xl ring-1 ring-indigo-400 dark:ring-indigo-600 scale-[1.02]'
      )}
    >
      {/* Drag handle */}
      <button
        {...(dragHandleProps ?? {})}
        className="mt-0.5 text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        aria-label="Drag to reorder"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm8 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM8 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm8 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM8 21a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm8 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        </svg>
      </button>

      {/* Order badge */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{step.order_by}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {step.description ?? `Step ${step.order_by}`}
            </p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
                {modelName}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                in: {inputType}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                out: {outputType}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-xs text-purple-700 dark:text-purple-300">
                {stepType}
              </span>
              {step.llm_temperature !== null && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                  temp: {step.llm_temperature}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-1 flex-shrink-0">
            <Tooltip content="Edit step">
              <button
                onClick={() => onEdit(step)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Edit step"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip content="Delete step">
              <button
                onClick={() => onDelete(step)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                aria-label="Delete step"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>

        {(step.llm_system_prompt || step.llm_user_prompt) && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-1"
            >
              <svg
                className={cn('w-3 h-3 transition-transform duration-200', expanded && 'rotate-90')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {expanded ? 'Hide prompts' : 'Show prompts'}
              {step.llm_system_prompt && (
                <span className="ml-1 px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px]">
                  sys: {step.llm_system_prompt.length}ch
                </span>
              )}
              {step.llm_user_prompt && (
                <span className="ml-0.5 px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px]">
                  usr: {step.llm_user_prompt.length}ch
                </span>
              )}
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden space-y-2"
                >
                  {step.llm_system_prompt && (
                    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-2.5 border border-zinc-200 dark:border-zinc-700">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">System Prompt</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
                        {step.llm_system_prompt}
                      </p>
                    </div>
                  )}
                  {step.llm_user_prompt && (
                    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-2.5 border border-zinc-200 dark:border-zinc-700">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">User Prompt</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
                        {step.llm_user_prompt}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

interface SortableStepItemProps {
  step: HumorFlavorStep
  models: LlmModel[]
  inputTypes: LlmInputType[]
  outputTypes: LlmOutputType[]
  stepTypes: HumorFlavorStepType[]
  flavorId: number
  onEdit: (step: HumorFlavorStep) => void
  onDelete: (step: HumorFlavorStep) => void
}

function SortableStepItem({
  step,
  models,
  inputTypes,
  outputTypes,
  stepTypes,
  onEdit,
  onDelete,
}: SortableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <StepItemContent
        step={step}
        models={models}
        inputTypes={inputTypes}
        outputTypes={outputTypes}
        stepTypes={stepTypes}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={false}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

interface StepListProps {
  flavorId: number
  initialSteps: HumorFlavorStep[]
  models: LlmModel[]
  inputTypes: LlmInputType[]
  outputTypes: LlmOutputType[]
  stepTypes: HumorFlavorStepType[]
  isNewFlavor?: boolean
}

export function StepList({
  flavorId,
  initialSteps,
  models,
  inputTypes,
  outputTypes,
  stepTypes,
  isNewFlavor = false,
}: StepListProps) {
  const [steps, setSteps] = useState<HumorFlavorStep[]>(initialSteps)
  const [showAddForm, setShowAddForm] = useState(isNewFlavor && initialSteps.length === 0)
  const [editingStep, setEditingStep] = useState<HumorFlavorStep | null>(null)
  const [deletingStep, setDeletingStep] = useState<HumorFlavorStep | null>(null)
  const [activeId, setActiveId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const activeStep = activeId ? steps.find((s) => s.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = steps.findIndex((s) => s.id === active.id)
    const newIndex = steps.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(steps, oldIndex, newIndex).map((step, index) => ({
      ...step,
      order_by: index + 1,
    }))

    setSteps(reordered)

    try {
      const response = await fetch(`/api/flavors/${flavorId}/steps/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: reordered.map((s) => ({ id: s.id, order_by: s.order_by })),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Failed to save new order')
      }

      toast.success('Steps reordered')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reorder failed')
      setSteps(initialSteps)
    }
  }

  const handleAddSuccess = async () => {
    setShowAddForm(false)
    const response = await fetch(`/api/flavors/${flavorId}/steps`)
    if (response.ok) {
      const data = await response.json()
      setSteps(data.data ?? [])
    }
  }

  const handleEditSuccess = async () => {
    setEditingStep(null)
    const response = await fetch(`/api/flavors/${flavorId}/steps`)
    if (response.ok) {
      const data = await response.json()
      setSteps(data.data ?? [])
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingStep) return
    const response = await fetch(
      `/api/flavors/${flavorId}/steps/${deletingStep.id}`,
      { method: 'DELETE' }
    )
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error ?? 'Delete failed')
    }
    setSteps((prev) => prev.filter((s) => s.id !== deletingStep.id))
    setDeletingStep(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Steps ({steps.length})
        </h2>
        {!showAddForm && !editingStep && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Step
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 overflow-hidden"
          >
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Add New Step</h3>
            <StepForm
              flavorId={flavorId}
              models={models}
              inputTypes={inputTypes}
              outputTypes={outputTypes}
              stepTypes={stepTypes}
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingStep && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 overflow-hidden"
          >
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Edit Step</h3>
            <StepForm
              flavorId={flavorId}
              step={editingStep}
              models={models}
              inputTypes={inputTypes}
              outputTypes={outputTypes}
              stepTypes={stepTypes}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingStep(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {steps.length === 0 && !showAddForm ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <svg className="w-10 h-10 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-3">No steps yet. Add your first step to build the pipeline.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-medium shadow-sm shadow-indigo-500/30 transition-colors active:scale-[0.97]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add First Step
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              <AnimatePresence>
                {steps.map((step) => (
                  <motion.div
                    key={step.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SortableStepItem
                      step={step}
                      models={models}
                      inputTypes={inputTypes}
                      outputTypes={outputTypes}
                      stepTypes={stepTypes}
                      flavorId={flavorId}
                      onEdit={setEditingStep}
                      onDelete={setDeletingStep}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>

          <DragOverlay>
            {activeStep ? (
              <StepItemContent
                step={activeStep}
                models={models}
                inputTypes={inputTypes}
                outputTypes={outputTypes}
                stepTypes={stepTypes}
                onEdit={() => {}}
                onDelete={() => {}}
                isDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <AnimatePresence>
        {deletingStep && (
          <DeleteConfirm
            label={deletingStep.description ?? `Step ${deletingStep.order_by}`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeletingStep(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
