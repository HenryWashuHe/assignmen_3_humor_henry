'use client'

import { cn } from '@/lib/cn'

interface ProgressStepperProps {
  steps: string[]
  currentStep: number
  status: 'idle' | 'loading' | 'success' | 'error'
}

export function ProgressStepper({
  steps,
  currentStep,
  status,
}: ProgressStepperProps) {
  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isActive = index === currentStep && status === 'loading'
        const isDone = index === currentStep && status === 'success'
        const isError = index === currentStep && status === 'error'

        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isCompleted && 'bg-green-500 border-green-500 text-white',
                  isActive && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
                  isDone && 'bg-green-500 border-green-500 text-white',
                  isError && 'bg-red-500 border-red-500 text-white',
                  !isCompleted && !isActive && !isDone && !isError && 'border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600'
                )}
              >
                {isCompleted || isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : isError ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isActive && 'text-indigo-600 dark:text-indigo-400',
                  isCompleted || isDone ? 'text-green-600 dark:text-green-400' : '',
                  isError && 'text-red-600 dark:text-red-400',
                  !isActive && !isCompleted && !isDone && !isError && 'text-zinc-400 dark:text-zinc-600'
                )}
              >
                {step}
              </span>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mt-[-1rem] transition-all duration-500',
                  index < currentStep
                    ? 'bg-green-400 dark:bg-green-600'
                    : 'bg-zinc-200 dark:bg-zinc-700'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
