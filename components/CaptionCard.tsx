'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CaptionCardProps {
  index: number
  children: ReactNode
}

export function CaptionCard({ index, children }: CaptionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4), ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
