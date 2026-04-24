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

export function StepPipelineViz({ steps }: StepPipelineVizProps) {
  if (steps.length === 0) return null

  const sorted = [...steps].sort((a, b) => a.order_by - b.order_by)

  return (
    <div className="glass-surface mb-6 rounded-[26px] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#211922] dark:text-[#f6f6f3]">
            Pipeline Flow
          </h3>
          <p className="mt-1 text-xs text-[#62625b] dark:text-[#b4b4ad]">
            {steps.length} ordered step{steps.length !== 1 ? 's' : ''} in this flavor.
          </p>
        </div>
        <span className="rounded-full bg-[#e5e5e0] px-2.5 py-1 text-[11px] font-medium text-[#62625b] dark:bg-[#3e3e39] dark:text-[#b4b4ad]">
          Sequential execution
        </span>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-0 min-w-max">
          {sorted.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5 w-28">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl text-sm',
                    'bg-[#e5e5e0] border border-[#e0e0d9] dark:bg-[#3e3e39] dark:border-[#4a4a44]',
                    'text-[#e60023] dark:text-[#ff4d6a] font-semibold',
                    'relative z-10'
                  )}
                >
                  {step.order_by}
                </div>
                <p
                  className="text-xs text-center text-[#211922] dark:text-[#f6f6f3] font-medium truncate w-full px-1"
                  title={step.description ?? `Step ${step.order_by}`}
                >
                  {step.description ?? `Step ${step.order_by}`}
                </p>
                {step.humor_flavor_step_types?.slug && (
                  <span className="text-xs text-[#91918c] truncate w-full text-center px-1">
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
                      className="text-[#e60023]/40 dark:text-[#e60023]/30"
                      style={{ animation: 'dash 1.5s linear infinite', strokeDashoffset: 20 }}
                    />
                    <polygon
                      points="28,4 32,8 28,12"
                      fill="currentColor"
                      className="text-[#e60023]/40 dark:text-[#e60023]/30"
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
