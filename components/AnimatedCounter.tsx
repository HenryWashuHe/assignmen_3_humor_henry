'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  className,
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  })
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString())
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true
      motionValue.set(value)
    }
  }, [motionValue, value])

  return <motion.span className={className}>{display}</motion.span>
}
