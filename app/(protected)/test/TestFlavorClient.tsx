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
  initialFlavorId?: string
}

type ImageSource = 'upload' | 'study-set'
type StudySetMode = 'single' | 'batch'
type LoadingStage = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

interface GeneratedCaption {
  id?: string
  content?: string
  [key: string]: unknown
}

interface BatchRunResult {
  imageId: string
  imageUrl: string | null
  imageDescription: string | null
  additionalContext: string | null
  status: 'pending' | 'processing' | 'done' | 'error'
  captions: GeneratedCaption[]
  error: string | null
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

export function TestFlavorClient({ flavors, imageSets, initialFlavorId }: TestFlavorClientProps) {
  const [flavorId, setFlavorId] = useState<string>(initialFlavorId ?? flavors[0]?.id?.toString() ?? '')
  const [imageSource, setImageSource] = useState<ImageSource>('upload')
  const [studySetMode, setStudySetMode] = useState<StudySetMode>('single')
  const [selectedSetId, setSelectedSetId] = useState<string>('')
  const [setImages, setSetImages] = useState<Image[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [stage, setStage] = useState<LoadingStage>('idle')
  const [stageMessage, setStageMessage] = useState('')
  const [captions, setCaptions] = useState<GeneratedCaption[]>([])
  const [batchResults, setBatchResults] = useState<BatchRunResult[]>([])
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

  const normalizeCaptions = (payload: unknown): GeneratedCaption[] => {
    if (Array.isArray(payload)) {
      return payload as GeneratedCaption[]
    }

    if (payload && typeof payload === 'object' && 'captions' in payload) {
      const captionsPayload = (payload as { captions?: unknown }).captions
      if (Array.isArray(captionsPayload)) {
        return captionsPayload as GeneratedCaption[]
      }
    }

    if (payload && typeof payload === 'object') {
      return [payload as GeneratedCaption]
    }

    return []
  }

  const generateCaptionsForImage = async (imageId: string, token: string) => {
    const captionRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId,
        humorFlavorId: Number(flavorId),
      }),
    })

    if (!captionRes.ok) {
      const txt = await captionRes.text()
      throw new Error(`Failed to generate captions: ${txt}`)
    }

    return normalizeCaptions(await captionRes.json())
  }

  const uploadAndRegisterImage = async (file: File, token: string) => {
    const authHeaders = { Authorization: `Bearer ${token}` }
    const contentType = file.type || 'image/jpeg'

    setStageMessage('Getting presigned upload URL...')
    const presignRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType }),
    })

    if (!presignRes.ok) {
      const txt = await presignRes.text()
      throw new Error(`Failed to get presigned URL: ${txt}`)
    }

    const { presignedUrl, cdnUrl } = await presignRes.json()

    setStageMessage('Uploading image...')
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType },
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
    return regData.imageId as string
  }

  const handleSetChange = async (setId: string) => {
    setSelectedSetId(setId)
    setSelectedImageId('')
    setSetImages([])
    setBatchResults([])
    setCaptions([])
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
      setBatchResults([])
      const token = await getToken()

      if (imageSource === 'study-set' && studySetMode === 'batch') {
        if (!selectedSetId || setImages.length === 0) {
          setError('Please select a study image set with at least one image')
          setStage('idle')
          return
        }

        setStage('processing')
        setStageMessage(`Processing 0/${setImages.length} images...`)
        setBatchResults(
          setImages.map((image) => ({
            imageId: image.id,
            imageUrl: image.url ?? null,
            imageDescription: image.image_description ?? null,
            additionalContext: image.additional_context ?? null,
            status: 'pending',
            captions: [],
            error: null,
          }))
        )

        let completedCount = 0

        await Promise.all(
          setImages.map(async (image) => {
            setBatchResults((prev) =>
              prev.map((result) =>
                result.imageId === image.id
                  ? { ...result, status: 'processing', error: null }
                  : result
              )
            )

            try {
              const generatedCaptions = await generateCaptionsForImage(image.id, token)
              completedCount += 1
              setBatchResults((prev) =>
                prev.map((result) =>
                  result.imageId === image.id
                    ? {
                        ...result,
                        status: 'done',
                        captions: generatedCaptions,
                        error: null,
                      }
                    : result
                )
              )
            } catch (error) {
              completedCount += 1
              setBatchResults((prev) =>
                prev.map((result) =>
                  result.imageId === image.id
                    ? {
                        ...result,
                        status: 'error',
                        captions: [],
                        error: error instanceof Error ? error.message : 'Generation failed',
                      }
                    : result
                )
              )
            } finally {
              setStageMessage(`Processing ${completedCount}/${setImages.length} images...`)
            }
          })
        )

        setStage('done')
        setStageMessage(`Completed ${setImages.length} study-set image runs`)
        return
      }

      let imageId: string

      if (imageSource === 'upload') {
        if (!selectedFile) {
          setError('Please select an image file to upload')
          setStage('idle')
          return
        }

        imageId = await uploadAndRegisterImage(selectedFile, token)
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
      setCaptions(await generateCaptionsForImage(imageId, token))
      setStage('done')
      setStageMessage('Captions generated')
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
        <div className="glass-surface rounded-[24px] p-5">
          <p className="text-xs font-medium text-[#91918c] uppercase tracking-wider mb-4">
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
      <div className="glass-surface rounded-[28px] p-6 space-y-5">
        <h2 className="text-base font-semibold text-[#211922] dark:text-[#f6f6f3]">Configuration</h2>

        {/* Flavor selection */}
        <div>
          <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-1.5">
            Humor Flavor <span className="text-red-500">*</span>
          </label>
          <select
            value={flavorId}
            onChange={(e) => setFlavorId(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2.5 rounded-[16px] border border-[#e5e5e0] dark:border-[#3e3e39] bg-white dark:bg-[#3e3e39] text-[#211922] dark:text-[#f6f6f3] focus:outline-none focus:ring-2 focus:ring-[#e60023]/40 dark:focus:ring-[#e60023]/30 text-sm disabled:opacity-60 transition-colors"
          >
            <option value="">Select a flavor...</option>
            {flavors.map((f) => (
              <option key={f.id} value={f.id}>{f.slug}</option>
            ))}
          </select>
        </div>

        {/* Image source */}
        <div>
          <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-2">
            Image Source
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setImageSource('upload')}
              disabled={isLoading}
              className={cn(
                'flex-1 py-2.5 rounded-[16px] text-sm font-medium border transition-all duration-200 disabled:opacity-60',
                imageSource === 'upload'
                  ? 'bg-[#e60023] dark:bg-[#e60023] text-white border-transparent shadow-sm shadow-[#e60023]/30'
                  : 'border-[#e5e5e0] dark:border-[#3e3e39] text-[#62625b] dark:text-[#b4b4ad] hover:bg-[#f6f6f3] dark:hover:bg-[#3e3e39] hover:border-[#e60023]/30 dark:hover:border-[#e60023]/40'
              )}
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setImageSource('study-set')}
              disabled={isLoading}
              className={cn(
                'flex-1 py-2.5 rounded-[16px] text-sm font-medium border transition-all duration-200 disabled:opacity-60',
                imageSource === 'study-set'
                  ? 'bg-[#e60023] dark:bg-[#e60023] text-white border-transparent shadow-sm shadow-[#e60023]/30'
                  : 'border-[#e5e5e0] dark:border-[#3e3e39] text-[#62625b] dark:text-[#b4b4ad] hover:bg-[#f6f6f3] dark:hover:bg-[#3e3e39] hover:border-[#e60023]/30 dark:hover:border-[#e60023]/40'
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
                'border-2 border-dashed rounded-[20px] p-8 text-center cursor-pointer transition-all duration-200',
                isDragging
                  ? 'border-[#e60023]/50 dark:border-[#e60023]/60 bg-[#e60023]/10 dark:bg-[#e60023]/20/40 ring-4 ring-[#e60023]/20'
                  : 'border-[#e5e5e0] dark:border-[#3e3e39] hover:border-[#e60023]/30 dark:hover:border-[#e60023]/40 hover:bg-[#f6f6f3] dark:hover:bg-[#3e3e39]/50'
              )}
            >
              {previewUrl ? (
                <div className="space-y-2">
                  <motion.img
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-[16px] object-contain shadow-md"
                  />
                  <p className="text-xs text-[#91918c]">{selectedFile?.name}</p>
                  <p className="text-xs text-[#e60023] dark:text-[#ff4d6a] font-medium">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-[20px] bg-[#e5e5e0] dark:bg-[#3e3e39] flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-[#91918c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#62625b] dark:text-[#b4b4ad]">
                      {isDragging ? 'Drop your image here' : 'Click or drag & drop an image'}
                    </p>
                    <p className="text-xs text-[#91918c] mt-1">PNG, JPG, GIF, WebP supported</p>
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
              <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-2">
                Run Mode
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStudySetMode('single')
                    setBatchResults([])
                  }}
                  disabled={isLoading}
                  className={cn(
                    'flex-1 py-2.5 rounded-[16px] text-sm font-medium border transition-all duration-200 disabled:opacity-60',
                    studySetMode === 'single'
                      ? 'bg-[#e60023] dark:bg-[#e60023] text-white border-transparent shadow-sm shadow-[#e60023]/30'
                      : 'border-[#e5e5e0] dark:border-[#3e3e39] text-[#62625b] dark:text-[#b4b4ad] hover:bg-[#f6f6f3] dark:hover:bg-[#3e3e39] hover:border-[#e60023]/30 dark:hover:border-[#e60023]/40'
                  )}
                >
                  Single Image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudySetMode('batch')
                    setSelectedImageId('')
                    setCaptions([])
                  }}
                  disabled={isLoading}
                  className={cn(
                    'flex-1 py-2.5 rounded-[16px] text-sm font-medium border transition-all duration-200 disabled:opacity-60',
                    studySetMode === 'batch'
                      ? 'bg-[#e60023] dark:bg-[#e60023] text-white border-transparent shadow-sm shadow-[#e60023]/30'
                      : 'border-[#e5e5e0] dark:border-[#3e3e39] text-[#62625b] dark:text-[#b4b4ad] hover:bg-[#f6f6f3] dark:hover:bg-[#3e3e39] hover:border-[#e60023]/30 dark:hover:border-[#e60023]/40'
                  )}
                >
                  Full Study Set
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-1.5">
                Study Image Set
              </label>
              <select
                value={selectedSetId}
                onChange={(e) => handleSetChange(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 rounded-[16px] border border-[#e5e5e0] dark:border-[#3e3e39] bg-white dark:bg-[#3e3e39] text-[#211922] dark:text-[#f6f6f3] focus:outline-none focus:ring-2 focus:ring-[#e60023]/40 dark:focus:ring-[#e60023]/30 text-sm disabled:opacity-60 transition-colors"
              >
                <option value="">Select a set...</option>
                {imageSets.map((s) => (
                  <option key={s.id} value={s.id}>{s.slug}</option>
                ))}
              </select>
            </div>

            {setImages.length > 0 && studySetMode === 'single' && (
              <div>
                <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-2">
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
                        'relative aspect-square rounded-[16px] overflow-hidden border-2 transition-all duration-200 disabled:opacity-60',
                        selectedImageId === img.id
                          ? 'border-[#e60023] dark:border-[#ff4d6a] shadow-md shadow-[#e60023]/20'
                          : 'border-transparent hover:border-[#91918c] dark:hover:border-[#62625b]'
                      )}
                    >
                      {img.url ? (
                        <img
                          src={img.url}
                          alt={img.image_description ?? 'Image'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#e5e5e0] dark:bg-[#3e3e39] flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#91918c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                          </svg>
                        </div>
                      )}
                      {selectedImageId === img.id && (
                        <div className="absolute inset-0 bg-[#e60023]/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-[#e60023] flex items-center justify-center shadow">
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

            {setImages.length > 0 && studySetMode === 'batch' && (
              <div className="rounded-[22px] border border-[#e5e5e0] dark:border-[#3e3e39] bg-[#f6f6f3]/80 dark:bg-[#2a2a25]/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#211922] dark:text-[#f6f6f3]">
                      Run the entire study set
                    </p>
                    <p className="text-xs text-[#91918c] mt-1 leading-relaxed">
                      This will submit all {setImages.length} images in the selected set for the
                      chosen flavor and show per-image results below as they finish.
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#e60023]/10 dark:bg-[#e60023]/20 border border-[#e60023]/20 dark:border-[#e60023]/30 text-xs font-medium text-[#e60023] dark:text-[#ff4d6a] whitespace-nowrap">
                    {setImages.length} image{setImages.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[20px] bg-[#e60023] hover:bg-[#c9001e] dark:bg-[#e60023] dark:hover:bg-[#e60023] text-white font-medium shadow-sm shadow-[#e60023]/30 hover:shadow-md hover:shadow-[#e60023]/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
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
              {imageSource === 'study-set' && studySetMode === 'batch'
                ? 'Generate Captions for Study Set'
                : 'Generate Captions'}
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-[22px] border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {batchResults.length > 0 && (
        <div className="glass-surface rounded-[28px] p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-[#211922] dark:text-[#f6f6f3]">
                Study Set Results
              </h2>
              <p className="text-sm text-[#91918c] mt-1">
                {batchResults.filter((result) => result.status === 'done').length} of{' '}
                {batchResults.length} completed
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#e5e5e0] dark:bg-[#3e3e39] text-xs font-medium text-[#62625b] dark:text-[#b4b4ad]">
              {batchResults.filter((result) => result.status === 'error').length} error
              {batchResults.filter((result) => result.status === 'error').length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4">
            {batchResults.map((result, index) => (
              <motion.div
                key={result.imageId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.3) }}
                className="overflow-hidden rounded-[24px] border border-[#e5e5e0] dark:border-[#3e3e39]"
              >
                <div className="flex items-start gap-4 bg-[#f6f6f3]/80 p-4 dark:bg-[#2a2a25]/40">
                  <div className="w-20 h-20 rounded-[16px] overflow-hidden bg-[#e5e5e0] dark:bg-[#3e3e39] flex-shrink-0">
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt={result.imageDescription ?? 'Study set image'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#91918c]">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#211922] dark:text-[#f6f6f3]">
                        {result.imageDescription ?? `Image ${index + 1}`}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          result.status === 'done' &&
                            'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
                          result.status === 'processing' &&
                            'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
                          result.status === 'pending' &&
                            'bg-[#e5e5e0] dark:bg-[#3e3e39] text-[#62625b] dark:text-[#b4b4ad]',
                          result.status === 'error' &&
                            'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                        )}
                      >
                        {result.status}
                      </span>
                    </div>

                    {result.additionalContext && (
                      <p className="text-xs text-[#91918c] mt-1 line-clamp-2">
                        {result.additionalContext}
                      </p>
                    )}

                    {result.status === 'processing' && (
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                        Generating captions...
                      </p>
                    )}

                    {result.status === 'error' && result.error && (
                      <p className="text-xs text-red-600 dark:text-red-300 mt-2">
                        {result.error}
                      </p>
                    )}
                  </div>
                </div>

                {result.captions.length > 0 && (
                  <div className="p-4 space-y-2 bg-white dark:bg-[#33332e]">
                    {result.captions.map((caption, captionIndex) => {
                      const captionText = caption.content ?? JSON.stringify(caption)
                      return (
                        <div
                          key={caption.id ?? `${result.imageId}-${captionIndex}`}
                          className="group relative rounded-[16px] bg-[#f6f6f3] dark:bg-[#3e3e39] border border-[#e5e5e0] dark:border-[#3e3e39] p-3 pr-10"
                        >
                          <p className="text-sm text-[#211922] dark:text-[#f6f6f3] leading-relaxed">
                            {captionText}
                          </p>
                          <button
                            onClick={() => handleCopy(captionText)}
                            className="absolute top-2.5 right-2.5 p-1.5 rounded-md text-[#91918c] hover:text-[#211922] dark:hover:text-[#f6f6f3] hover:bg-[#e5e5e0] dark:hover:bg-[#3e3e39] transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Copy caption"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {stage === 'done' && captions.length > 0 && (
        <div className="glass-surface rounded-[28px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-[#211922] dark:text-[#f6f6f3]">
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
                  className="p-4 rounded-[20px] bg-[#f6f6f3] dark:bg-[#3e3e39] border border-[#e5e5e0] dark:border-[#3e3e39] group relative hover:border-[#e60023]/20 dark:hover:border-[#e60023]/30 transition-colors"
                >
                  <div className="flex items-start gap-3 pr-10">
                    <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e60023]/10 dark:bg-[#e60023]/15 text-xs font-semibold text-[#e60023] dark:text-[#ff4d6a]">
                      {index + 1}
                    </span>
                    <p className="text-sm text-[#211922] dark:text-[#f6f6f3] leading-relaxed">
                      {caption.content ?? JSON.stringify(caption, null, 2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(caption.content ?? JSON.stringify(caption))}
                    className="absolute top-3 right-3 p-1.5 rounded-md text-[#91918c] hover:text-[#211922] dark:hover:text-[#f6f6f3] hover:bg-[#e5e5e0] dark:hover:bg-[#3e3e39] transition-all opacity-0 group-hover:opacity-100"
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

      {stage === 'done' && captions.length === 0 && batchResults.length === 0 && (
        <div className="glass-surface rounded-[24px] p-6 text-center">
          <p className="text-sm text-[#91918c]">
            Pipeline completed but no captions were returned.
          </p>
        </div>
      )}
    </div>
  )
}
