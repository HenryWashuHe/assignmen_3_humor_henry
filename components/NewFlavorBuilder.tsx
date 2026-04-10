'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/cn'
import {
  CreateStepPayload,
  HumorFlavorStepType,
  LlmInputType,
  LlmModel,
  LlmOutputType,
} from '@/lib/types'

interface DraftStep extends CreateStepPayload {
  draftId: string
}

interface NewFlavorBuilderProps {
  models: LlmModel[]
  inputTypes: LlmInputType[]
  outputTypes: LlmOutputType[]
  stepTypes: HumorFlavorStepType[]
}

type PromptTarget = 'system' | 'user'

const runtimeTemplateVars = [
  '${imageAdditionalContext}',
  '${tenRandomTerms}',
  '${tenRandomCaptionExamples}',
  '${startRandomizeLines}',
  '${endRandomizeLines}',
]

const starterStepDescriptions = [
  'celebrity-recognition',
  'image-description',
  'caption-generation',
]

const starterPrompts = {
  celebrityRecognition: {
    system: `I am an eagle eyed humor assistant. Your job is to recognize celebrities, politicians, world leaders, and other famous people. You also specialize in recognizing popular memes and scenes from television shows and movies. You only respond in JSON.`,
    user: `Identify any famous or recognizable content in this image including people, shows, movies, locations, brands, events, popular memes, or cultural references.

Respond in JSON format:
{
  "content": [
    {
      "name": "Full name",
      "type": "celebrity" | "politician" | "cartoon_character" | "tv_show" | "movie" | "location" | "building" | "event" | "brand" | "logo" | "meme" | "other",
      "confidence": 0-100,
      "description": "Brief context including character name if applicable"
    }
  ],
  "scene_context": "Overall description of what this image represents if it's from famous media or a significant event"
}

Important:
- For actors, use type "celebrity" and include their character name in the description
- Don't create separate entries for both actor and character - combine them
- Look beyond just people - identify shows, movies, locations, brands, logos, buildings, events
- Include source material when relevant
- Only return empty array if truly nothing recognizable is found
- Lower confidence if uncertain
- Only respond in JSON format
- If you recognize nothing in the image, return an empty JSON set "{}"`,
  },
  imageDescription: {
    system: `You are an eagle eyed image description assistant.`,
    user: `Describe this picture in detail with the subject's demeanor and the image itself.

Also explain how the background relates to the broader context of the image. If it appears to be from a movie scene, cultural event, show, or notable location, include that context instead of just describing shapes and colors.

Use the following scene description for context:

*****************
\${step1Output}
*****************

If the subject is not human or does not exist at all, anthropomorphize it.
Find humorous elements about the picture.
Keep your response to 150 words.
If the image is of a place or iconic building, mention it specifically.

Most important:
- include concrete visual anchors, not just overall vibe
- mention posture, facial expression, clothes, props, setting, and any weird or highly specific detail
- if there is a visual detail a caption could latch onto, explicitly mention it
- write so later joke-writing steps can stay tightly grounded in what is actually visible`,
  },
  captionGeneration: {
    system: `You are a dark humor assistant.
You are tasked with helping users look over a picture and create funny relatable scenarios that sound Gen Z, entertaining, and short.

Make sure it is funny.

Do not prefix the entries with numbers.
Return a JSON array of raw, unescaped strings.
Do not include category labels or section headers.

Test Panel JSON response requirements:
Return ONLY valid JSON.
If multiple captions are requested, return a JSON array of strings.
No prose.
No markdown.
No explanation.
No object wrappers beyond the JSON string or JSON array response itself.
No code fences.`,
    user: `Here is a description of an image. I want you to roast it:

\${step2Output}

********************
People and locations in this image include \${step1Output}
********************
Here is some additional context for the image, if available:

\${imageAdditionalContext}

********************
Here are ten words or phrases you can use to help make the captions funnier. You don't have to use them all.

Words:
\${tenRandomTerms}

********************
Write ten short captions for this image.

Keep the joke short and punchy.

Here are the rules for the caption:

\${startRandomizeLines}
- Must be under 12 words
- Should sound like a meme page caption: sharp, ironic, and punchy
- Should anthropomorphize objects or map the subject to a real life situation
- Should avoid long sentences, setups, or explanations
- Should not use the "When you feel like X but Y" formula
- Should be as mean as possible. Nothing is off limits.
\${endRandomizeLines}

********************
Example captions:
\${tenRandomCaptionExamples}

********************
Return ONLY valid JSON.`,
  },
  columbiaAngles: {
    system: `You are a savage campus roast writer with elite observational taste.
You write like a brutally funny Columbia / Barnard / Sidechat insider who instantly spots social delusion, fake prestige, cringe networking energy, try-hard intellectual theater, and status obsession.

Your job is to generate strong joke ANGLES, not safe generic captions.

Voice rules:
- sarcastic
- cutting
- socially precise
- screenshot-worthy
- confident, never timid

Comedy rules:
- be mean in the roast-comedy sense
- attack ego, posture, delusion, cringe, social climbing, fake-deep behavior, internship worship, finance-consulting brainrot, startup cosplay, seminar-performance energy, and campus hierarchy games
- every angle must be rooted in something actually visible or clearly inferable from the image description
- do not target protected traits
- do not use slurs
- do not make the joke vague
- do not sound like therapy language
- do not sound like HR language
- do not explain why something is funny

Return only valid JSON.`,
    user: `You are building caption angles for a Columbia / Sidechat style meme page.

Use this recognizable-content analysis:
\${step1Output}

Use this image description:
\${step2Output}

Optional additional context:
\${imageAdditionalContext}

Generate a JSON array of 12 short roast angles.

Rules:
- Each angle should identify one funny social interpretation of the image
- Favor Columbia / Barnard / Sidechat humor when relevant
- Focus on status obsession, fake deep behavior, awkward try-hard energy, resume culture, elitism, campus lore, finance / consulting / startup delusion, and social-climber vibes
- Make them harsher and more specific than a generic meme page
- Make each angle visibly traceable to image details, expression, styling, props, or setting
- Avoid angles that only reference campus stereotypes without tying them to this image
- Keep each angle under 20 words
- Do not write final captions yet
- Return only a JSON array of strings`,
  },
  columbiaCritic: {
    system: `You are a ruthless comedy editor with no patience for weak jokes.
You exist to reject captions that are generic, soft, obvious, bloated, or fake-edgy.

You are not writing the first draft. You are judging whether the joke actually lands hard enough to post.

Your taste:
- specific over generic
- sharp over wordy
- socially accurate over random absurdity
- confident over try-hard
- meaner over safer, as long as it does not target protected traits

Return only valid JSON.`,
    user: `Evaluate the candidate roast angles below for how funny they would be as a Columbia / Sidechat style caption set.

Recognizable-content context:
\${step1Output}

Image description:
\${step2Output}

Candidate angles:
\${step3Output}

Return JSON in this shape:
{
  "best_angles": ["...", "..."],
  "missed_visual_details": [
    "specific thing in the image the jokes ignored"
  ],
  "notes": [
    "what is too generic",
    "what needs to be meaner or more specific",
    "which social dynamics should be exploited harder"
  ],
  "target_style": "one paragraph describing the ideal vibe of the final captions"
}

Judging rules:
- Penalize generic meme phrasing
- Penalize captions that could apply to a different image
- Penalize captions that ignore concrete visual details
- Reward highly specific, screenshot-worthy observations
- Reward Columbia / Barnard / Sidechat relevance when available
- Prefer captions that sound like someone posting with confidence, not like an AI writing a joke
- If the set is weak, say exactly why
- Be blunt in the notes
- Call out softness, vagueness, over-explaining, and missed social observations`,
  },
  columbiaFinal: {
    system: `You are a darkly funny campus meme caption writer.
Your task is to produce captions that feel cruelly accurate, socially precise, and immediately postable.

You should sound like:
- a sarcastic insider
- not an AI
- not a stand-up comic doing setup/punchline
- not a safe brand account

Style rules:
- sharp
- concise
- cutting
- specific
- screenshot-worthy
- comfortable being mean in the roast-comedy sense

Do:
- mock ego
- mock status performance
- mock fake prestige
- mock social-climber energy
- mock fake-deep campus personas
- mock consulting/finance/startup delusion when relevant

Do not:
- use slurs
- target protected traits
- explain the joke
- write soft filler
- sound inspirational

Return ONLY valid JSON.
If multiple captions are requested, return a JSON array of strings and nothing else.`,
    user: `Write 10 final captions for this image.

Image description:
\${step2Output}

Recognizable people / places / references:
\${step1Output}

Candidate joke angles:
\${step3Output}

Critic notes and best directions:
\${step4Output}

Optional extra context:
\${imageAdditionalContext}

Optional funny vocabulary:
\${tenRandomTerms}

Rules:
\${startRandomizeLines}
- Under 12 words
- Extremely punchy
- More sarcastic than explanatory
- Prefer specific social observations over generic reaction captions
- Every caption must hook onto at least one concrete thing actually visible in the image
- If a caption could fit a random different image, reject it and write a more image-specific one
- Sound like a Sidechat / Columbia meme account when relevant
- Roast ego, cringe, status games, fake depth, try-hard energy, resume culture, finance-consulting delusion, and campus theater
- Avoid the exact formula "when you ..."
- Avoid sounding like a generic Twitter meme account
- If a caption feels obvious, make it nastier or more socially specific
\${endRandomizeLines}

Return only a JSON array of 10 strings.`,
  },
}

function findBestModelId(models: LlmModel[], candidates: string[]) {
  const lowerCandidates = candidates.map((candidate) => candidate.toLowerCase())
  const match = models.find((model) =>
    lowerCandidates.some((candidate) => model.name.toLowerCase().includes(candidate))
  )

  return match?.id ?? models[0]?.id ?? 0
}

function findBestTypeId<T extends { id: number; slug?: string; description?: string | null }>(
  values: T[],
  candidates: string[]
) {
  const lowerCandidates = candidates.map((candidate) => candidate.toLowerCase())
  const match = values.find((value) => {
    const slug = value.slug?.toLowerCase() ?? ''
    const description = value.description?.toLowerCase() ?? ''
    return lowerCandidates.some(
      (candidate) => slug.includes(candidate) || description.includes(candidate)
    )
  })

  return match?.id ?? values[0]?.id ?? 0
}

function buildStarterPipeline(
  models: LlmModel[],
  inputTypes: LlmInputType[],
  outputTypes: LlmOutputType[],
  stepTypes: HumorFlavorStepType[]
): DraftStep[] {
  const imageAndTextInputId = findBestTypeId(inputTypes, ['image-and-text', 'image', 'image + text'])
  const textOnlyInputId = findBestTypeId(inputTypes, ['text-only', 'text only', 'text'])
  const stringOutputId = findBestTypeId(outputTypes, ['string', 'text'])
  const arrayOutputId = findBestTypeId(outputTypes, ['array', 'json array', 'list'])
  const captionStepTypeId = findBestTypeId(stepTypes, ['caption', 'general'])
  const analysisStepTypeId = findBestTypeId(stepTypes, ['analysis', 'recognition', 'general'])

  return [
    {
      draftId: crypto.randomUUID(),
      description: 'celebrity-recognition',
      llm_system_prompt: starterPrompts.celebrityRecognition.system,
      llm_user_prompt: starterPrompts.celebrityRecognition.user,
      llm_model_id: findBestModelId(models, ['gemini 2.5 flash', 'gemini flash']),
      llm_temperature: 0.7,
      llm_input_type_id: imageAndTextInputId,
      llm_output_type_id: stringOutputId,
      humor_flavor_step_type_id: analysisStepTypeId,
    },
    {
      draftId: crypto.randomUUID(),
      description: 'image-description',
      llm_system_prompt: starterPrompts.imageDescription.system,
      llm_user_prompt: starterPrompts.imageDescription.user,
      llm_model_id: findBestModelId(models, ['gemini 2.5 flash', 'gemini flash']),
      llm_temperature: 0.7,
      llm_input_type_id: imageAndTextInputId,
      llm_output_type_id: stringOutputId,
      humor_flavor_step_type_id: analysisStepTypeId,
    },
    {
      draftId: crypto.randomUUID(),
      description: 'caption-generation',
      llm_system_prompt: starterPrompts.captionGeneration.system,
      llm_user_prompt: starterPrompts.captionGeneration.user,
      llm_model_id: findBestModelId(models, ['gpt 5 mini', 'gpt-5-mini', 'gpt 5']),
      llm_temperature: 0.7,
      llm_input_type_id: textOnlyInputId,
      llm_output_type_id: arrayOutputId,
      humor_flavor_step_type_id: captionStepTypeId,
    },
  ]
}

function buildColumbiaReflectivePipeline(
  models: LlmModel[],
  inputTypes: LlmInputType[],
  outputTypes: LlmOutputType[],
  stepTypes: HumorFlavorStepType[]
): DraftStep[] {
  const imageAndTextInputId = findBestTypeId(inputTypes, ['image-and-text', 'image', 'image + text'])
  const textOnlyInputId = findBestTypeId(inputTypes, ['text-only', 'text only', 'text'])
  const stringOutputId = findBestTypeId(outputTypes, ['string', 'text'])
  const arrayOutputId = findBestTypeId(outputTypes, ['array', 'json array', 'list'])
  const captionStepTypeId = findBestTypeId(stepTypes, ['caption', 'general'])
  const analysisStepTypeId = findBestTypeId(stepTypes, ['analysis', 'recognition', 'general'])
  const transformStepTypeId = findBestTypeId(stepTypes, ['transform', 'rewrite', 'general'])

  return [
    {
      draftId: crypto.randomUUID(),
      description: 'celebrity-recognition',
      llm_system_prompt: starterPrompts.celebrityRecognition.system,
      llm_user_prompt: starterPrompts.celebrityRecognition.user,
      llm_model_id: findBestModelId(models, ['gemini 2.5 flash', 'gemini flash']),
      llm_temperature: 0.4,
      llm_input_type_id: imageAndTextInputId,
      llm_output_type_id: stringOutputId,
      humor_flavor_step_type_id: analysisStepTypeId,
    },
    {
      draftId: crypto.randomUUID(),
      description: 'image-description',
      llm_system_prompt: starterPrompts.imageDescription.system,
      llm_user_prompt: starterPrompts.imageDescription.user,
      llm_model_id: findBestModelId(models, ['gemini 2.5 flash', 'gemini flash']),
      llm_temperature: 0.5,
      llm_input_type_id: imageAndTextInputId,
      llm_output_type_id: stringOutputId,
      humor_flavor_step_type_id: analysisStepTypeId,
    },
    {
      draftId: crypto.randomUUID(),
      description: 'columbia-angle-generation',
      llm_system_prompt: starterPrompts.columbiaAngles.system,
      llm_user_prompt: starterPrompts.columbiaAngles.user,
      llm_model_id: findBestModelId(models, ['gpt 5 mini', 'gpt-5-mini', 'gpt 5']),
      llm_temperature: 1.1,
      llm_input_type_id: textOnlyInputId,
      llm_output_type_id: arrayOutputId,
      humor_flavor_step_type_id: captionStepTypeId,
    },
    {
      draftId: crypto.randomUUID(),
      description: 'caption-critic',
      llm_system_prompt: starterPrompts.columbiaCritic.system,
      llm_user_prompt: starterPrompts.columbiaCritic.user,
      llm_model_id: findBestModelId(models, ['gpt 5 mini', 'gpt-5-mini', 'gpt 5']),
      llm_temperature: 0.3,
      llm_input_type_id: textOnlyInputId,
      llm_output_type_id: stringOutputId,
      humor_flavor_step_type_id: analysisStepTypeId,
    },
    {
      draftId: crypto.randomUUID(),
      description: 'final-captions',
      llm_system_prompt: starterPrompts.columbiaFinal.system,
      llm_user_prompt: starterPrompts.columbiaFinal.user,
      llm_model_id: findBestModelId(models, ['gpt 5 mini', 'gpt-5-mini', 'gpt 5']),
      llm_temperature: 0.9,
      llm_input_type_id: textOnlyInputId,
      llm_output_type_id: arrayOutputId,
      humor_flavor_step_type_id: transformStepTypeId,
    },
  ]
}

function createEmptyDraft(index: number, defaults: {
  modelId: number | null
  inputTypeId: number | null
  outputTypeId: number | null
  stepTypeId: number | null
}): DraftStep {
  return {
    draftId: crypto.randomUUID(),
    description: starterStepDescriptions[index] ?? '',
    llm_system_prompt: '',
    llm_user_prompt: '',
    llm_model_id: defaults.modelId ?? 0,
    llm_temperature: 0.7,
    llm_input_type_id: defaults.inputTypeId ?? 0,
    llm_output_type_id: defaults.outputTypeId ?? 0,
    humor_flavor_step_type_id: defaults.stepTypeId ?? 0,
  }
}

export function NewFlavorBuilder({
  models,
  inputTypes,
  outputTypes,
  stepTypes,
}: NewFlavorBuilderProps) {
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [draftSteps, setDraftSteps] = useState<DraftStep[]>([])
  const [activePrompt, setActivePrompt] = useState<PromptTarget>('user')
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const systemPromptRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const userPromptRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  const defaultIds = {
    modelId: models[0]?.id ?? null,
    inputTypeId: inputTypes[0]?.id ?? null,
    outputTypeId: outputTypes[0]?.id ?? null,
    stepTypeId: stepTypes[0]?.id ?? null,
  }

  const updateDraftStep = (
    draftId: string,
    updater: (draft: DraftStep) => DraftStep
  ) => {
    setDraftSteps((current) =>
      current.map((draft) => (draft.draftId === draftId ? updater(draft) : draft))
    )
  }

  const addDraftStep = () => {
    const draft = createEmptyDraft(draftSteps.length, defaultIds)
    setDraftSteps((current) => [...current, draft])
    setSelectedDraftId(draft.draftId)
  }

  const loadStarterPipeline = () => {
    if (draftSteps.length > 0 && !window.confirm('Replace the current draft steps with the starter Matrix pipeline?')) {
      return
    }

    const starterPipeline = buildStarterPipeline(models, inputTypes, outputTypes, stepTypes)
    setDraftSteps(starterPipeline)
    setSelectedDraftId(starterPipeline[0]?.draftId ?? null)
    toast.success('Loaded starter 3-step Matrix pipeline')
  }

  const loadColumbiaReflectivePreset = () => {
    if (draftSteps.length > 0 && !window.confirm('Replace the current draft steps with the Columbia roast preset?')) {
      return
    }

    const preset = buildColumbiaReflectivePipeline(models, inputTypes, outputTypes, stepTypes)
    setDraftSteps(preset)
    setSelectedDraftId(preset[0]?.draftId ?? null)
    setSlug((current) => current || 'columbia-sidechat-roast')
    setDescription((current) =>
      current ||
      'Columbia / Sidechat roast pipeline with recognition, description, angle generation, critique, and final rewrite.'
    )
    toast.success('Loaded Columbia roast preset with reflection loop')
  }

  const removeDraftStep = (draftId: string) => {
    setDraftSteps((current) => current.filter((draft) => draft.draftId !== draftId))
    setSelectedDraftId((current) => (current === draftId ? null : current))
  }

  const moveDraftStep = (draftId: string, direction: -1 | 1) => {
    setDraftSteps((current) => {
      const index = current.findIndex((draft) => draft.draftId === draftId)
      const nextIndex = index + direction

      if (index === -1 || nextIndex < 0 || nextIndex >= current.length) {
        return current
      }

      const copy = [...current]
      const [item] = copy.splice(index, 1)
      copy.splice(nextIndex, 0, item)
      return copy
    })
  }

  const getTemplateVarsForIndex = (index: number) =>
    Array.from({ length: index }, (_, previousIndex) => `\${step${previousIndex + 1}Output}`)

  const insertVariable = (draftId: string, variable: string) => {
    const isSystemTarget = activePrompt === 'system'
    const textarea = isSystemTarget
      ? systemPromptRefs.current[draftId]
      : userPromptRefs.current[draftId]

    const currentDraft = draftSteps.find((draft) => draft.draftId === draftId)
    if (!currentDraft) return

    const value = isSystemTarget
      ? currentDraft.llm_system_prompt
      : currentDraft.llm_user_prompt

    if (!textarea) {
      updateDraftStep(draftId, (draft) => ({
        ...draft,
        [isSystemTarget ? 'llm_system_prompt' : 'llm_user_prompt']:
          `${value}${value ? ' ' : ''}${variable}`,
      }))
      return
    }

    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? value.length
    const nextValue = `${value.slice(0, start)}${variable}${value.slice(end)}`

    updateDraftStep(draftId, (draft) => ({
      ...draft,
      [isSystemTarget ? 'llm_system_prompt' : 'llm_user_prompt']: nextValue,
    }))

    requestAnimationFrame(() => {
      textarea.focus()
      const caretPosition = start + variable.length
      textarea.setSelectionRange(caretPosition, caretPosition)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!slug.trim()) {
      setError('Slug is required')
      return
    }

    if (draftSteps.length === 0) {
      setError('Add at least one step to create a usable humor flavor')
      return
    }

    const invalidStep = draftSteps.find(
      (step) =>
        !step.llm_model_id ||
        !step.llm_input_type_id ||
        !step.llm_output_type_id ||
        !step.humor_flavor_step_type_id
    )

    if (invalidStep) {
      setError('Every step needs a model, input type, output type, and step type')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const flavorRes = await fetch('/api/flavors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug.trim(),
          description: description.trim(),
        }),
      })

      if (!flavorRes.ok) {
        const data = await flavorRes.json()
        throw new Error(data.error ?? 'Failed to create flavor')
      }

      const flavorData = await flavorRes.json()
      const flavorId = flavorData.data?.id

      if (!flavorId) {
        throw new Error('Flavor created without an id')
      }

      for (const step of draftSteps) {
        const stepRes = await fetch(`/api/flavors/${flavorId}/steps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: step.description.trim(),
            llm_system_prompt: step.llm_system_prompt.trim(),
            llm_user_prompt: step.llm_user_prompt.trim(),
            llm_model_id: step.llm_model_id,
            llm_temperature: step.llm_temperature,
            llm_input_type_id: step.llm_input_type_id,
            llm_output_type_id: step.llm_output_type_id,
            humor_flavor_step_type_id: step.humor_flavor_step_type_id,
          }),
        })

        if (!stepRes.ok) {
          const data = await stepRes.json()
          throw new Error(data.error ?? `Failed to create step "${step.description}"`)
        }
      }

      toast.success('Flavor and pipeline created')
      router.push(`/flavors/${flavorId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = cn(
    'w-full px-3 py-2 rounded-[16px] border border-[#e5e5e0] dark:border-[#3e3e39]',
    'bg-white dark:bg-[#33332e] text-[#211922] dark:text-[#f6f6f3]',
    'focus:outline-none focus:ring-2 focus:ring-[#e60023]/40 dark:focus:ring-[#e60023]/30',
    'text-sm transition-shadow'
  )

  const promptClass = cn(
    inputClass,
    'font-mono text-xs bg-[#f6f6f3] dark:bg-[#2a2a25] resize-y',
    'placeholder-[#91918c] dark:placeholder-[#62625b]'
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="glass-surface rounded-[28px] p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#211922] dark:text-[#f6f6f3]">
            Flavor Identity
          </h2>
          <p className="text-sm text-[#91918c] mt-1">
            Define the flavor itself, then author the full joke-generation pipeline below.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-1">
            Slug <span className="text-[#e60023]">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. dark-humor-columbia"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the humor strategy and what the pipeline is trying to do."
            rows={3}
            className={cn(inputClass, 'resize-none')}
          />
        </div>
      </div>

      <div className="glass-surface rounded-[28px] p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#211922] dark:text-[#f6f6f3]">
              Pipeline Steps
            </h2>
            <p className="text-sm text-[#91918c] mt-1">
              Build the actual multi-step chain users expect: recognition, description, caption
              generation, and any extra style/context steps.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadStarterPipeline}
              className="flex items-center gap-2 px-3 py-2 rounded-[16px] border border-[#e5e5e0] dark:border-[#3e3e39] text-[#62625b] dark:text-[#b4b4ad] bg-[#f6f6f3] dark:bg-[#3e3e39]/50 text-sm font-medium transition-colors hover:bg-[#e5e5e0] dark:hover:bg-[#3e3e39]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Load Starter Pipeline
            </button>
            <button
              type="button"
              onClick={loadColumbiaReflectivePreset}
              className="flex items-center gap-2 rounded-[16px] border border-[#e5e5e0] dark:border-[#3e3e39] bg-[#f6f6f3] dark:bg-[#3e3e39]/50 px-3 py-2 text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] transition-colors hover:bg-[#e5e5e0] dark:hover:bg-[#3e3e39]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 12h8m-8 5h5M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
              Load Columbia Roast Loop
            </button>
            <button
              type="button"
              onClick={addDraftStep}
              className="flex items-center gap-2 px-3 py-2 rounded-[16px] bg-[#e60023] hover:bg-[#c9001e] text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Step
            </button>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#e5e5e0] dark:border-[#3e3e39] bg-[#f6f6f3] dark:bg-[#2a2a25] p-4">
          <p className="text-sm font-medium text-[#211922] dark:text-[#f6f6f3]">
            Starter pipeline available
          </p>
          <p className="text-xs text-[#91918c] mt-1 leading-relaxed">
            Use <span className="font-medium">Load Starter Pipeline</span> to prefill a
            3-step Matrix chain with celebrity recognition, image description, and caption
            generation prompts using the variables you described.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[#91918c]">
            Use <span className="font-medium">Load Columbia Roast Loop</span> for a sharper preset:
            recognition, description, Columbia/Sidechat angle generation, critic step, and final rewrite.
          </p>
        </div>

        {draftSteps.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#e5e5e0] dark:border-[#3e3e39] p-8 text-center">
            <p className="text-sm text-[#91918c]">
              No steps yet. Add the recognition/description/caption steps you want this flavor to run.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {draftSteps.map((draft, index) => {
              const selectedModel = models.find((model) => model.id === draft.llm_model_id)
              const supportsTemperature = selectedModel?.is_temperature_supported ?? false
              const availableTemplateVars = getTemplateVarsForIndex(index)
              const isExpanded = selectedDraftId === draft.draftId

              return (
                <div
                  key={draft.draftId}
                  className="overflow-hidden rounded-[24px] border border-[#e5e5e0] dark:border-[#3e3e39] bg-white/70 dark:bg-[#33332e]/60"
                >
                  <div className="flex items-center gap-3 p-4 bg-[#f6f6f3] dark:bg-[#2a2a25]">
                    <div className="w-7 h-7 rounded-full bg-[#e60023]/10 dark:bg-[#e60023]/20 border border-[#e60023]/20 dark:border-[#e60023]/30 flex items-center justify-center text-xs font-semibold text-[#e60023] dark:text-[#ff4d6a]">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#211922] dark:text-[#f6f6f3] truncate">
                        {draft.description || `Step ${index + 1}`}
                      </p>
                      <p className="text-xs text-[#91918c] mt-0.5">
                        {selectedModel?.name ?? 'Select a model'} • {draft.llm_temperature ?? '—'} temp
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDraftId((current) =>
                            current === draft.draftId ? null : draft.draftId
                          )
                        }
                        className="px-3 py-1.5 rounded-[16px] border border-[#e5e5e0] dark:border-[#3e3e39] text-sm text-[#62625b] dark:text-[#b4b4ad] hover:bg-white dark:hover:bg-[#33332e] transition-colors"
                      >
                        {isExpanded ? 'Hide' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDraftStep(draft.draftId, -1)}
                        disabled={index === 0}
                        className="p-2 rounded-[16px] border border-[#e5e5e0] dark:border-[#3e3e39] text-[#62625b] dark:text-[#b4b4ad] disabled:opacity-40"
                        aria-label="Move step up"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDraftStep(draft.draftId, 1)}
                        disabled={index === draftSteps.length - 1}
                        className="p-2 rounded-[16px] border border-[#e5e5e0] dark:border-[#3e3e39] text-[#62625b] dark:text-[#b4b4ad] disabled:opacity-40"
                        aria-label="Move step down"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDraftStep(draft.draftId)}
                        className="p-2 rounded-[16px] border border-[#e60023]/20 dark:border-[#e60023]/30 text-[#e60023] dark:text-[#ff4d6a]"
                        aria-label="Delete step"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 space-y-4 bg-white dark:bg-[#33332e]">
                      <div className="rounded-[20px] border border-[#e60023]/15 dark:border-[#e60023]/20 bg-[#e60023]/5 dark:bg-[#e60023]/8 p-4 space-y-3">
                        <div>
                          <h3 className="text-sm font-semibold text-[#211922] dark:text-[#f6f6f3]">
                            Step Authoring
                          </h3>
                          <p className="text-xs text-[#62625b] dark:text-[#b4b4ad] mt-1 leading-relaxed">
                            Use each step to contribute something specific to the humor chain. Earlier
                            outputs can be referenced in later prompts.
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#e60023] dark:text-[#ff4d6a] mb-2">
                            Available Earlier Step Outputs
                          </p>
                          {availableTemplateVars.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {availableTemplateVars.map((variable) => (
                                <button
                                  key={variable}
                                  type="button"
                                  onClick={() => insertVariable(draft.draftId, variable)}
                                  className="px-2.5 py-1 rounded-[12px] border border-[#e60023]/20 dark:border-[#e60023]/25 bg-white/80 dark:bg-[#33332e] text-xs font-medium text-[#e60023] dark:text-[#ff4d6a] hover:bg-white dark:hover:bg-[#3e3e39] transition-colors"
                                >
                                  {variable}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-[#62625b] dark:text-[#b4b4ad]">
                              This is the first step. Later steps will be able to reference it as{' '}
                              <span className="font-mono">${'{step1Output}'}</span>.
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#e60023] dark:text-[#ff4d6a] mb-2">
                            Common Runtime Variables
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {runtimeTemplateVars.map((variable) => (
                              <button
                                key={variable}
                                type="button"
                                onClick={() => insertVariable(draft.draftId, variable)}
                                className="px-2.5 py-1 rounded-[12px] border border-[#e5e5e0] dark:border-[#3e3e39] bg-white/80 dark:bg-[#33332e] text-xs font-medium text-[#62625b] dark:text-[#b4b4ad] hover:bg-white dark:hover:bg-[#3e3e39] transition-colors"
                              >
                                {variable}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-1">
                          Step Description
                        </label>
                        <input
                          type="text"
                          value={draft.description}
                          onChange={(e) =>
                            updateDraftStep(draft.draftId, (current) => ({
                              ...current,
                              description: e.target.value,
                            }))
                          }
                          placeholder="e.g. celebrity-recognition"
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-1">
                            Model
                          </label>
                          <select
                            value={draft.llm_model_id}
                            onChange={(e) =>
                              updateDraftStep(draft.draftId, (current) => ({
                                ...current,
                                llm_model_id: Number(e.target.value),
                              }))
                            }
                            className={inputClass}
                          >
                            {models.map((model) => (
                              <option key={model.id} value={model.id}>
                                {model.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-1">
                            Temperature
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="2"
                            step="0.1"
                            value={draft.llm_temperature ?? 0.7}
                            onChange={(e) =>
                              updateDraftStep(draft.draftId, (current) => ({
                                ...current,
                                llm_temperature: Number(e.target.value),
                              }))
                            }
                            disabled={!supportsTemperature}
                            className={cn(inputClass, !supportsTemperature && 'opacity-60 cursor-not-allowed')}
                          />
                          <p className="text-[11px] text-[#91918c] mt-1">
                            {supportsTemperature
                              ? 'Editable for this model.'
                              : 'This model does not support temperature. Switch models to edit it.'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-1">
                            Input Type
                          </label>
                          <select
                            value={draft.llm_input_type_id}
                            onChange={(e) =>
                              updateDraftStep(draft.draftId, (current) => ({
                                ...current,
                                llm_input_type_id: Number(e.target.value),
                              }))
                            }
                            className={inputClass}
                          >
                            {inputTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.description}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-1">
                            Output Type
                          </label>
                          <select
                            value={draft.llm_output_type_id}
                            onChange={(e) =>
                              updateDraftStep(draft.draftId, (current) => ({
                                ...current,
                                llm_output_type_id: Number(e.target.value),
                              }))
                            }
                            className={inputClass}
                          >
                            {outputTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.description}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-1">
                            Step Type
                          </label>
                          <select
                            value={draft.humor_flavor_step_type_id}
                            onChange={(e) =>
                              updateDraftStep(draft.draftId, (current) => ({
                                ...current,
                                humor_flavor_step_type_id: Number(e.target.value),
                              }))
                            }
                            className={inputClass}
                          >
                            {stepTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.description ?? type.slug}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-1">
                          System Prompt
                        </label>
                        <textarea
                          ref={(node) => {
                            systemPromptRefs.current[draft.draftId] = node
                          }}
                          value={draft.llm_system_prompt}
                          onFocus={() => {
                            setSelectedDraftId(draft.draftId)
                            setActivePrompt('system')
                          }}
                          onChange={(e) =>
                            updateDraftStep(draft.draftId, (current) => ({
                              ...current,
                              llm_system_prompt: e.target.value,
                            }))
                          }
                          rows={5}
                          placeholder="System-level instructions for this step..."
                          className={promptClass}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#62625b] dark:text-[#b4b4ad] mb-1">
                          User Prompt
                        </label>
                        <textarea
                          ref={(node) => {
                            userPromptRefs.current[draft.draftId] = node
                          }}
                          value={draft.llm_user_prompt}
                          onFocus={() => {
                            setSelectedDraftId(draft.draftId)
                            setActivePrompt('user')
                          }}
                          onChange={(e) =>
                            updateDraftStep(draft.draftId, (current) => ({
                              ...current,
                              llm_user_prompt: e.target.value,
                            }))
                          }
                          rows={8}
                          placeholder="User-facing prompt template for this step..."
                          className={promptClass}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] bg-[#e60023] text-white text-sm font-medium hover:bg-[#c9001e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Flavor...' : `Create Flavor with ${draftSteps.length} Step${draftSteps.length === 1 ? '' : 's'}`}
        </button>
      </div>
    </form>
  )
}
