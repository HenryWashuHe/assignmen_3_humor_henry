export interface Profile {
  id: string
  is_superadmin: boolean
  is_matrix_admin: boolean
  first_name: string | null
  last_name: string | null
  email: string | null
}

export interface HumorFlavor {
  id: number
  slug: string
  description: string | null
  created_datetime_utc: string | null
}

export interface HumorFlavorStep {
  id: number
  humor_flavor_id: number
  order_by: number
  llm_temperature: number | null
  llm_input_type_id: number | null
  llm_output_type_id: number | null
  llm_model_id: number | null
  humor_flavor_step_type_id: number | null
  llm_system_prompt: string | null
  llm_user_prompt: string | null
  description: string | null
  llm_models?: LlmModel | null
  llm_input_types?: LlmInputType | null
  llm_output_types?: LlmOutputType | null
  humor_flavor_step_types?: HumorFlavorStepType | null
}

export interface LlmModel {
  id: number
  name: string
  provider_model_id: string
  llm_provider_id: number | null
  is_temperature_supported: boolean
}

export interface LlmInputType {
  id: number
  description: string
  slug: string
}

export interface LlmOutputType {
  id: number
  description: string
  slug: string
}

export interface HumorFlavorStepType {
  id: number
  slug: string
  description: string | null
}

export interface Caption {
  id: string
  content: string | null
  created_datetime_utc: string | null
  humor_flavor_id: number | null
  image_id: string | null
  profile_id: string | null
  is_public: boolean | null
  caption_request_id: number | null
  llm_prompt_chain_id: number | null
  humor_flavors?: HumorFlavor | null
  images?: Image | null
}

export interface Image {
  id: string
  url: string | null
  additional_context: string | null
  image_description: string | null
}

export interface StudyImageSet {
  id: number
  slug: string
  description: string | null
}

export interface StudyImageSetImageMapping {
  id: number
  study_image_set_id: number
  image_id: string
  images?: Image | null
}

export interface CreateFlavorPayload {
  slug: string
  description: string
}

export interface UpdateFlavorPayload {
  slug?: string
  description?: string
}

export interface CreateStepPayload {
  description: string
  llm_system_prompt: string
  llm_user_prompt: string
  llm_model_id: number
  llm_temperature: number | null
  llm_input_type_id: number
  llm_output_type_id: number
  humor_flavor_step_type_id: number
}

export interface UpdateStepPayload extends Partial<CreateStepPayload> {}

export interface ReorderStepsPayload {
  steps: { id: number; order_by: number }[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}
