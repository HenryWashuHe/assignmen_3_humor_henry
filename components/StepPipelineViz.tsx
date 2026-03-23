'use client'

import { cn } from '@/lib/cn'

interface PipelineStep {
  id: number
  order_by: number
  description: string | null
  llm_models?: { name: string } | null
  humor_flavor_step_types?: { slug: string } | null
}

interface StepPipelineVizProps {
  steps: PipelineStep[]
}

const stepTypeIcons: Record<string, string> = {
  caption: '💬',
  analysis: '🔍',
  transform: '⚡',
  filter: '🎯',
  default: '📦',
}

function getIcon(slug?: string | null): string {
  if (!slug) return stepTypeIcons.default
  return stepTypeIcons[slug] ?? stepTypeIcons.default
}

export function StepPipelineViz({ steps }: StepPipelineVizProps) {
  if (steps.length === 0) return null

  const sorted = [...steps].sort((a, b) => a.order_by - b.order_by)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 mb-6">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
        Pipeline ({steps.length} step{steps.length !== 1 ? 's' : ''})
      </h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-0 min-w-max">
          {sorted.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5 w-28">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm',
                    'bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-200 dark:border-indigo-800',
                    'text-indigo-700 dark:text-indigo-300 font-semibold',
                    'relative z-10'
                  )}
                >
                  {step.order_by}
                </div>
                <p
                  className="text-xs text-center text-zinc-600 dark:text-zinc-400 font-medium truncate w-full px-1"
                  title={step.description ?? `Step ${step.order_by}`}
                >
                  {step.description ?? `Step ${step.order_by}`}
                </p>
                {step.humor_flavor_step_types?.slug && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate w-full text-center px-1">
                    {step.humor_flavor_step_types.slug}
                  </span>
                )}
              </div>

              {/* Connector line */}
              {index < sorted.length - 1 && (
                <div className="relative flex items-center mx-1" style={{ width: 32 }}>
                  <svg width="32" height="16" viewBox="0 0 32 16">
                    <line
                      x1="0"
                      y1="8"
                      x2="28"
                      y2="8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      className="text-indigo-300 dark:text-indigo-700"
                      style={{ animation: 'dash 1.5s linear infinite', strokeDashoffset: 20 }}
                    />
                    <polygon
                      points="28,4 32,8 28,12"
                      fill="currentColor"
                      className="text-indigo-300 dark:text-indigo-700"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
