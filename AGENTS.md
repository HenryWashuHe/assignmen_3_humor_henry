# AGENTS.md

## Snapshot

This file describes the current structure and purpose of the repository as inspected on 2026-04-03.
It is optimized for AI assistants that need fast orientation before making changes.

## Repository Purpose

This repository is an internal admin dashboard called "The Matrix".

Its main purpose is to manage and test "humor flavors", where a humor flavor is an ordered LLM prompt pipeline used to generate image captions.

Important product clarification:
A humor flavor is not just a label plus a few prompts. It is intended to be a chained sequence of optimized reasoning steps where each step can feed later steps. A typical flavor may include:
- celebrity/entity recognition
- scene or image description
- final caption generation
- additional style/personality/context steps

The expected authoring model is that users configure those steps directly in the app.

Primary user capabilities:
- Authenticate with Google via Supabase.
- View dashboard metrics for flavors and captions.
- Create, edit, delete, and inspect humor flavors.
- Define, edit, delete, and reorder pipeline steps within a flavor.
- Browse generated captions.
- Test a flavor by uploading an image or selecting one from a study image set, then calling an external caption-generation API.

## Stack

- Framework: Next.js 14 App Router
- Language: TypeScript
- UI: React 18, Tailwind CSS v4, Framer Motion
- Auth and data: Supabase SSR + browser clients
- Drag/drop: `@dnd-kit`
- Charts: `recharts`
- Notifications: `sonner`

## High-Level Architecture

The app is mostly server-rendered for data reads and auth checks, with client components used for interactive editing flows.

- `app/`
  Next.js routes, layouts, API routes, and protected pages.
- `components/`
  Reusable UI and interaction components.
- `lib/`
  Shared utilities, types, and Supabase client factories.
- `middleware.ts`
  Session-aware route protection for non-public routes.

## Product Semantics

This section reflects the intended behavior described by the user/product notes and should be treated as canonical product context even if every detail is not yet visible in the inspected code.

### What a humor flavor is

A humor flavor represents a caption-generation strategy.

Each flavor contains:
- a stable identity: slug and description
- an ordered sequence of prompt steps
- model and parameter choices per step
- a strategy for transforming an image into intermediate reasoning outputs and then into final captions

The flavor system is intended for experimentation and evaluation, not just one-shot caption generation.

### How step chaining works

Each step executes in sequence.

Outputs from earlier steps are expected to be usable by later steps through template variables or equivalent pipeline substitution. The user-provided examples imply chained placeholders such as:
- `${step1Output}`
- `${step2Output}`
- `${imageAdditionalContext}`
- `${tenRandomTerms}`
- `${tenRandomCaptionExamples}`

This means future agents should think of `humor_flavor_steps` as pipeline nodes, not independent prompts.

### Typical step categories

Common step categories mentioned in the product notes:
- celebrity recognition
- entity recognition
- image description
- context mapping
- personality/style
- final caption generation

### Typical step configuration

For each step, the intended configurable parameters are:
- description
- system prompt
- user prompt
- model
- temperature
- input type
- output type
- execution order

The current UI and API already expose most of these fields directly.

### Example chained flavor

The user-provided example describes a 3-step pattern:

1. Step 1:
   Recognize celebrities, memes, media, places, brands, or other famous content from an image and emit structured JSON.
2. Step 2:
   Describe the image in detail using the previous recognition output for context.
3. Step 3:
   Generate multiple short captions using the image description, recognition output, optional image context, and randomized style inputs.

This is the intended shape of a flavor authoring experience in The Matrix.

## Route Map

### Public routes

- `app/login/page.tsx`
  Login screen.
- `app/login/LoginForm.tsx`
  Starts Google OAuth sign-in through Supabase.
- `app/auth/callback/route.ts`
  Exchanges OAuth code for a session and redirects to `/dashboard`.
- `app/unauthorized/page.tsx`
  Shown when the user is authenticated but lacks the required admin role.

### Protected route group

Protected routes live under `app/(protected)/`.

- `layout.tsx`
  Loads the current Supabase user and profile.
  Only allows users with `is_superadmin` or `is_matrix_admin`.
  Renders the shared sidebar and command palette shell.

- `dashboard/page.tsx`
  Overview page.
  Reads total flavor count, total caption count, recent flavors, and 30-day caption activity.

- `flavors/page.tsx`
  Lists all humor flavors.
  Also computes per-flavor step counts.

- `flavors/new/page.tsx`
  Creates a new humor flavor.

- `flavors/[id]/page.tsx`
  Flavor detail page.
  Loads:
  - flavor metadata
  - all steps for the flavor
  - model/input/output/step type lookup tables
  Renders flavor details, a simple pipeline visualization, and the step editor/list.

- `flavors/[id]/edit/page.tsx`
  Dedicated flavor edit page.
  Note: the detail page also supports inline editing through a client component.

- `captions/page.tsx`
  Caption browser with pagination and flavor filtering.

- `test/page.tsx`
  Flavor testing page.
  Lets admins run a selected flavor against either:
  - an uploaded image
  - an image from a study image set

The broader intended testing workflow is to execute a full multi-step flavor pipeline and inspect caption-generation behavior, not merely submit one prompt.

## API Route Map

These routes support CRUD operations for the admin UI.

- `app/api/flavors/route.ts`
  - `GET`: list flavors
  - `POST`: create flavor

- `app/api/flavors/[id]/route.ts`
  - `GET`: fetch single flavor
  - `PUT`: update flavor
  - `DELETE`: delete flavor

- `app/api/flavors/[id]/steps/route.ts`
  - `GET`: list steps for a flavor
  - `POST`: create step for a flavor

- `app/api/flavors/[id]/steps/[stepId]/route.ts`
  - `PUT`: update step
  - `DELETE`: delete step

- `app/api/flavors/[id]/steps/reorder/route.ts`
  - `POST`: persist drag-and-drop `order_by` changes

- `app/api/stats/captions-over-time/route.ts`
  - `GET`: return grouped 30-day caption counts

## Main Domain Model

The core TypeScript model definitions are in `lib/types.ts`.

Key entities inferred from the code:
- `profiles`
  User roles and identity metadata.
- `humor_flavors`
  Top-level flavor records.
- `humor_flavor_steps`
  Ordered pipeline steps belonging to a flavor.
- `llm_models`
  Available models. Includes whether temperature is supported.
- `llm_input_types`
  Step input type lookup table.
- `llm_output_types`
  Step output type lookup table.
- `humor_flavor_step_types`
  Step type lookup table.
- `captions`
  Generated caption records.
- `images`
  Image metadata used by captions and study sets.
- `study_image_sets`
  Curated image collections for testing.
- `study_image_set_image_mappings`
  Join table between image sets and images.

Additional data and concepts implied by the product notes:
- loaded values for reusable step outputs, especially celebrity recognition and image description
- prompt-chain execution records
- step-level outputs for debugging
- caption request tracking

Some of these are referenced conceptually in the product notes but are not fully modeled in `lib/types.ts`.

## Core User Flows

### 1. Authentication and authorization

1. Middleware allows public auth routes and redirects unauthenticated users to `/login`.
2. Protected layout loads the user profile from Supabase.
3. Only `is_superadmin` or `is_matrix_admin` can access the app shell.

### 2. Create a new flavor

1. User opens `/flavors/new`.
2. `FlavorForm` sends `POST /api/flavors`.
3. On success, the client redirects to `/flavors/:id?new=true`.
4. The detail page opens with the step editor ready for the first step.

### 3. Build a pipeline

1. `StepList` displays all steps in `order_by` order.
2. `StepForm` creates or updates individual steps.
3. Drag-and-drop reorder is handled client-side with `@dnd-kit`.
4. Reorder persistence is sent to `POST /api/flavors/:id/steps/reorder`.

Important interpretation:
The goal of this workflow is for the user to construct a joke-generation chain, not just maintain metadata. Each step should be authored as part of a reasoning pipeline optimized for humor generation.

### 4. Test a flavor

Handled by `app/(protected)/test/TestFlavorClient.tsx`.

Flow:
1. Select a flavor.
2. Choose image source:
   - upload a file
   - select an image from a study image set
3. Get Supabase access token from the browser session.
4. Call external API endpoints to:
   - generate a presigned upload URL
   - upload the image
   - register the image
   - generate captions
5. Render returned captions in the UI.

Broader intended behavior from the product notes:
- The Matrix should support study image sets for controlled evaluation.
- Testing may run across a whole image set, not just one image.
- Runs are expected to expose per-step or intermediate outputs for debugging.
- Caption requests may run asynchronously and in parallel.

The inspected UI currently supports selecting one uploaded image or one image from a study set and then generating captions for a selected flavor.

### 5. Loaded values and cost optimization

Per the product notes, some steps are intended to reuse previously computed outputs instead of always calling an LLM again.

Named examples:
- celebrity recognition
- image description

If an image already has those values stored in Admin, the pipeline is expected to consume them directly. This is a cost and latency optimization and is part of the intended system behavior.

This loaded-value behavior is not directly visible in the inspected frontend code, so it likely lives in the external pipeline or adjacent backend systems.

### 6. Captions and observability

The intended product behavior is that a generated caption is associated with:
- the originating flavor
- the image
- a caption request record
- a prompt-chain execution record
- intermediate outputs for each step
- model configuration details such as model and temperature
- processing metadata such as timing

The current captions page surfaces a subset of this data directly in the UI. The richer prompt-chain inspection appears to be expected product behavior but is not fully implemented in the inspected routes/components.

## Important Components

- `components/Sidebar.tsx`
  Main navigation and sign-out.
- `components/FlavorForm.tsx`
  Flavor create/edit form.
- `components/FlavorDetailClient.tsx`
  Inline flavor edit/delete actions on the detail page.
- `components/StepForm.tsx`
  Step create/edit form.
- `components/StepList.tsx`
  Step list, drag-and-drop reordering, edit/delete flows.
- `components/StepPipelineViz.tsx`
  Lightweight visual representation of step ordering.
- `components/CaptionCard.tsx`
  Presentation wrapper for caption entries.
- `components/DashboardStats.tsx`
  Dashboard stat cards and chart card wrappers.

## External Dependencies and Boundaries

### Supabase

The app depends heavily on Supabase for:
- authentication
- session handling
- role lookup in `profiles`
- all application data reads and writes

Supabase client factories:
- `lib/supabase-server.ts`
- `lib/supabase-browser.ts`

### External caption pipeline API

The flavor testing UI calls a separate backend:

- Base URL hardcoded in `app/(protected)/test/TestFlavorClient.tsx`
- Current value: `https://api.almostcrackd.ai`

Endpoints used by the UI:
- `POST /pipeline/generate-presigned-url`
- `POST /pipeline/upload-image-from-url`
- `POST /pipeline/generate-captions`

This means the actual caption-generation logic is not implemented in this repository.

### Caption pipeline call order

Canonical request sequence from the product notes:

1. `POST /pipeline/generate-presigned-url`
   Body includes `contentType`.
2. `PUT <presignedUrl>`
   Upload raw image bytes directly to storage.
3. `POST /pipeline/upload-image-from-url`
   Register the uploaded CDN URL and receive `imageId`.
4. `POST /pipeline/generate-captions`
   Submit `imageId`, optionally with `humorFlavorId` for flavor-specific generation.

Authentication:
- Requires a valid Supabase JWT bearer token.

Supported image types from the product notes:
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`
- `image/gif`
- `image/heic`

## Environment Assumptions

Required environment variables inferred from the code:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

No server-side service role usage is present in the inspected code.

## What Is Not In This Repository

These important pieces are referenced but not defined here:
- Supabase schema or migrations
- Seed data
- Formal backend docs
- Automated tests
- README
- The implementation of the external caption-generation pipeline
- The loaded-value reuse mechanism for precomputed recognition/description steps
- The full prompt-chain execution and inspection backend

When changing this repo, do not assume the schema beyond what is directly queried in the code.

## Change Guidance For Future Agents

- Start with `app/(protected)/layout.tsx` to understand auth and access control.
- Use `lib/types.ts` as the fastest domain model reference.
- Treat humor flavors as sequential joke-generation pipelines, not as isolated prompts.
- For flavor management changes, trace:
  - `flavors/[id]/page.tsx`
  - `components/FlavorDetailClient.tsx`
  - `components/StepList.tsx`
  - `components/StepForm.tsx`
  - `app/api/flavors/**`
- For caption-generation behavior, inspect `app/(protected)/test/TestFlavorClient.tsx` first.
- When reasoning about product behavior, distinguish between:
  - what is currently implemented in this frontend
  - what the external pipeline is expected to support
- Be careful with assumptions around database relationships because the schema is external.
- Be careful with assumptions around business logic because the generation pipeline lives outside this repo.
- If implementing flavor authoring, preserve support for chained step outputs and prompt templates.
- If implementing testing or caption inspection, assume intermediate step outputs are an important product requirement.

## Short Summary

This is an internal experimentation platform for configuring ordered, chained LLM prompt pipelines ("humor flavors"), testing them on images or study sets, and generating captions through an external API with an emphasis on debugging and evaluation.
