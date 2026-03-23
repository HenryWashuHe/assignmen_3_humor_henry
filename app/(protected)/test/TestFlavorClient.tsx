'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-browser'
import { HumorFlavor, StudyImageSet, Image } from '@/lib/types'
import { ProgressStepper } from '@/components/ProgressStepper'
import { cn } from '@/lib/cn'

const API_BASE = 'https://api.almostcrackd.ai'

interface TestFlavorClientProps {
  flavors: Pick<HumorFlavor, 'id' | 'slug'>[]
  imageSets: Pick<StudyImageSet, 'id' | 'slug' | 'description'>[]
}

type ImageSource = 'upload' | 'study-set'
type LoadingStage = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

interface GeneratedCaption {
  id?: string
  content?: string
  [key: string]: unknown
}

const PIPELINE_STEPS = ['Upload Image', 'Process', 'Generate Captions', 'Done']

function getStepIndex(stage: LoadingStage): number {
  switch (stage) {
    case 'idle': return -1
    case 'uploading': return 0
    case 'processing': return 2
    case 'done': return 3
    case 'error': return 0
    default: return -1
  }
}

function getStepperStatus(stage: LoadingStage): 'idle' | 'loading' | 'success' | 'error' {
  if (stage === 'done') return 'success'
  if (stage === 'error') return 'error'
  if (stage === 'uploading' || stage === 'processing') return 'loading'
  return 'idle'
}

export function TestFlavorClient({ flavors, imageSets }: TestFlavorClientProps) {
  const [flavorId, setFlavorId] = useState<string>(flavors[0]?.id?.toString() ?? '')
  const [imageSource, setImageSource] = useState<ImageSource>('upload')
  const [selectedSetId, setSelectedSetId] = useState<string>('')
  const [setImages, setSetImages] = useState<Image[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [stage, setStage] = useState<LoadingStage>('idle')
  const [stageMessage, setStageMessage] = useState('')
  const [captions, setCaptions] = useState<GeneratedCaption[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getToken = async (): Promise<string> => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('No active session. Please sign in.')
    return session.access_token
  }

  const handleSetChange = async (setId: string) => {
    setSelectedSetId(setId)
    setSelectedImageId('')
    setSetImages([])
    if (!setId) return

    const supabase = createClient()
    const { data } = await supabase
      .from('study_image_set_image_mappings')
      .select('images(id, url, additional_context, image_description)')
      .eq('study_image_set_id', Number(setId))

    const images: Image[] = (data ?? [])
      .map((row: { images: Image | Image[] | null }) => {
        const img = row.images
        return Array.isArray(img) ? img[0] : img
      })
      .filter((img): img is Image => img !== null && img !== undefined)

    setSetImages(images)
  }

  const setFile = (file: File) => {
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setFile(file)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleGenerate = async () => {
    if (!flavorId) {
      setError('Please select a humor flavor')
      return
    }

    try {
      setStage('uploading')
      setError(null)
      setCaptions([])
      const token = await getToken()
      const authHeaders = { Authorization: `Bearer ${token}` }

      let imageId: string

      if (imageSource === 'upload') {
        if (!selectedFile) {
          setError('Please select an image file to upload')
          setStage('idle')
          return
        }

        setStageMessage('Getting presigned upload URL...')
        const presignRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
          method: 'POST',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
        })

        if (!presignRes.ok) {
          const txt = await presignRes.text()
          throw new Error(`Failed to get presigned URL: ${txt}`)
        }

        const { presignedUrl, cdnUrl } = await presignRes.json()

        setStageMessage('Uploading image...')
        const uploadRes = await fetch(presignedUrl, {
          method: 'PUT',
          body: selectedFile,
          headers: { 'Content-Type': selectedFile.type },
        })

        if (!uploadRes.ok) throw new Error('Failed to upload image')

        setStageMessage('Registering image...')
        const regRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
          method: 'POST',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
        })

        if (!regRes.ok) {
          const txt = await regRes.text()
          throw new Error(`Failed to register image: ${txt}`)
        }

        const regData = await regRes.json()
        imageId = regData.imageId
      } else {
        if (!selectedImageId) {
          setError('Please select an image from the study set')
          setStage('idle')
          return
        }
        imageId = selectedImageId
      }

      setStage('processing')
      setStageMessage('Generating captions...')

      const captionRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, humorFlavorId: Number(flavorId) }),
      })

      if (!captionRes.ok) {
        const txt = await captionRes.text()
        throw new Error(`Failed to generate captions: ${txt}`)
      }

      const captionData = await captionRes.json()
      const result = Array.isArray(captionData) ? captionData : captionData.captions ?? [captionData]
      setCaptions(result)
      setStage('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setStage('error')
    }
  }

  const isLoading = stage === 'uploading' || stage === 'processing'
  const currentStep = getStepIndex(stage)
  const stepperStatus = getStepperStatus(stage)

  return (
    <div className="max-w-3xl space-y-6">
      {/* Progress Stepper — only when active */}
      {stage !== 'idle' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
            Pipeline Progress
          </p>
          <ProgressStepper
            steps={PIPELINE_STEPS}
            currentStep={currentStep}
            status={stepperStatus}
          />
        </div>
      )}

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Configuration</h2>

        {/* Flavor selection */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Humor Flavor <span className="text-red-500">*</span>
          </label>
          <select
            value={flavorId}
            onChange={(e) => setFlavorId(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm disabled:opacity-60 transition-colors"
          >
            <option value="">Select a flavor...</option>
            {flavors.map((f) => (
              <option key={f.id} value={f.id}>{f.slug}</option>
            ))}
          </select>
        </div>

        {/* Image source */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Image Source
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setImageSource('upload')}
              disabled={isLoading}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 disabled:opacity-60',
                imageSource === 'upload'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-transparent shadow-sm shadow-indigo-500/30'
                  : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700'
              )}
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setImageSource('study-set')}
              disabled={isLoading}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 disabled:opacity-60',
                imageSource === 'study-set'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-transparent shadow-sm shadow-indigo-500/30'
                  : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700'
              )}
            >
              Study Image Set
            </button>
          </div>
        </div>

        {/* Upload file with drag-and-drop */}
        {imageSource === 'upload' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                isDragging
                  ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 ring-4 ring-indigo-400/20'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              )}
            >
              {previewUrl ? (
                <div className="space-y-2">
                  <motion.img
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg object-contain shadow-md"
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedFile?.name}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {isDragging ? 'Drop your image here' : 'Click or drag & drop an image'}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">PNG, JPG, GIF, WebP supported</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Study set selection */}
        {imageSource === 'study-set' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Study Image Set
              </label>
              <select
                value={selectedSetId}
                onChange={(e) => handleSetChange(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm disabled:opacity-60 transition-colors"
              >
                <option value="">Select a set...</option>
                {imageSets.map((s) => (
                  <option key={s.id} value={s.id}>{s.slug}</option>
                ))}
              </select>
            </div>

            {setImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Select Image
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {setImages.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedImageId(img.id)}
                      disabled={isLoading}
                      className={cn(
                        'relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 disabled:opacity-60',
                        selectedImageId === img.id
                          ? 'border-indigo-500 dark:border-indigo-400 shadow-md shadow-indigo-500/20'
                          : 'border-transparent hover:border-zinc-400 dark:hover:border-zinc-600'
                      )}
                    >
                      {img.url ? (
                        <img
                          src={img.url}
                          alt={img.image_description ?? 'Image'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                          </svg>
                        </div>
                      )}
                      {selectedImageId === img.id && (
                        <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow">
                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {stageMessage || 'Processing...'}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Captions
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {stage === 'done' && captions.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Generated Captions ({captions.length})
            </h2>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {captions.map((caption, index) => (
                <motion.div
                  key={caption.id ?? index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.06 }}
                  className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group relative hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                >
                  <div className="flex items-start gap-3 pr-10">
                    <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {index + 1}
                    </span>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      {caption.content ?? JSON.stringify(caption, null, 2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(caption.content ?? JSON.stringify(caption))}
                    className="absolute top-3 right-3 p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Copy caption"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {stage === 'done' && captions.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Pipeline completed but no captions were returned.
          </p>
        </div>
      )}
    </div>
  )
}
