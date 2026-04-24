# Humor Project — End-to-End QA Plan (Assignment 3)

Owner: Henry He (sh4421@columbia.edu)
Date: 2026-04-24
Scope: Full system test across the three deployed apps that make up the
"almostcrackd.ai" humor platform.

The plan treats the system as a tree. Each top-level branch is one of the three
apps. Each sub-branch is a logical pathway a real user can take through that
app. Edge cases are listed alongside the happy paths they belong to.

---

## Apps under test

1. **Project 1 — Caption App** (consumer-facing)
   Public users sign in, generate captions on uploaded or curated images,
   browse, save, and rate captions.

2. **Project 2 — Admin Area** (back office)
   Superadmins manage users, role assignments, study image sets, image
   metadata, and review caption / engagement activity.

3. **Project 3 — The Matrix** (this repo)
   Internal prompt-chain authoring tool. Superadmins and matrix-admins
   create, edit, reorder, duplicate, and test "humor flavors" — ordered LLM
   prompt pipelines that the caption app actually runs.

All three share a Supabase backend and a separate caption-generation API at
`https://api.almostcrackd.ai`. The Matrix is the canonical authoring surface for
the pipelines that Project 1 executes.

---

## Project 1 — Caption App

### 1. Authentication

- [ ] Unauthenticated user lands on a public marketing / login screen.
- [ ] Google OAuth completes and routes the user into the app.
- [ ] OAuth cancel returns user to login with no broken state.
- [ ] Sign-out clears the session and blocks protected routes on next load.
- [ ] Session persists across page reload.
- [ ] Expired/invalid token forces re-authentication on next request.

### 2. Image upload pipeline

- [ ] Upload a JPG via file picker — preview shows, generation proceeds.
- [ ] Upload via drag-and-drop — same outcome.
- [ ] Upload PNG, WebP, GIF, HEIC — each accepted, served back correctly.
- [ ] Upload non-image (PDF, .txt) — rejected with a clear message.
- [ ] Upload very large file (>10 MB) — either succeeds or surfaces a clean
      size-limit error, not a crash.
- [ ] Cancel mid-upload — state resets cleanly.
- [ ] Network failure during upload — error toast, retry available.
- [ ] Upload completes the 4-step pipeline:
  1. `POST /pipeline/generate-presigned-url`
  2. `PUT <presignedUrl>` direct-to-storage
  3. `POST /pipeline/upload-image-from-url` (returns `imageId`)
  4. `POST /pipeline/generate-captions`

### 3. Caption generation

- [ ] Default flavor produces N captions in a reasonable time (<60s).
- [ ] Switching flavor before generation actually changes the output.
- [ ] Empty / null caption response renders an empty-state, not a blank page.
- [ ] Slow API response shows a loading state, not a frozen UI.
- [ ] API 5xx surfaces an error and lets the user retry without re-uploading.

### 4. Caption browse / rating

- [ ] Newly generated captions appear in user history.
- [ ] Pagination, infinite-scroll, or load-more works at boundary conditions
      (empty, 1 page, many pages).
- [ ] Rating / favorite / save / share controls fire the expected mutation,
      update the UI optimistically, and recover on failure.
- [ ] Filtering / sorting (by flavor, by date, by rating) returns the right set.
- [ ] Deep-link to a single caption renders correctly when shared.

### 5. Permissions / abuse guards

- [ ] A regular user cannot reach admin or matrix routes (302 → unauthorized).
- [ ] Rate-limit / throttle behaves predictably on rapid resubmits.
- [ ] No PII or secret leaks in console, network, or error messages.

### 6. Responsive / accessibility

- [ ] Layout works on mobile, tablet, desktop.
- [ ] Keyboard-only navigation reaches all interactive controls.
- [ ] Focus traps for modals close on Esc.
- [ ] Color contrast passes for primary text and CTAs in light + dark themes.

---

## Project 2 — Admin Area

### 1. Authentication & gating

- [ ] Only `is_superadmin = true` profiles can enter the admin shell.
- [ ] Non-admin authenticated users get a clean Access Denied page, not a
      crash or a partial render.
- [ ] Sign-out from admin returns user to the shared login.

### 2. User management

- [ ] User list loads with pagination/search.
- [ ] Filter by role (superadmin, matrix_admin, regular).
- [ ] Toggle `is_superadmin` / `is_matrix_admin` — change is persisted and
      effective on the affected user's next request.
- [ ] Granting `is_matrix_admin` immediately allows that user to enter
      The Matrix.
- [ ] Revoking `is_matrix_admin` blocks them on the next protected page load.
- [ ] Editing the current admin's own roles never lets them lock themselves
      out (or warns clearly before doing so).

### 3. Study image set management

- [ ] Create a new study image set (slug + description).
- [ ] Add images to a set via upload or URL.
- [ ] Remove images from a set.
- [ ] Edit image metadata: `additional_context`, `image_description`.
- [ ] Delete an empty set.
- [ ] Delete a non-empty set — either cascades cleanly or warns / blocks.
- [ ] Sets created here become selectable in The Matrix's Test Flavor page.

### 4. Caption / activity review

- [ ] Caption browser loads with filters by flavor, by user, by date.
- [ ] Inspect a caption's metadata: caption_request_id, llm_prompt_chain_id,
      flavor, model, image.
- [ ] Hide / soft-delete a caption — disappears from public surfaces.
- [ ] Bulk-action handling, if present, applies to the selected set only.

### 5. System health surfaces

- [ ] Counts on the admin dashboard match raw DB counts (spot-checked).
- [ ] 30-day caption activity chart renders and matches the captions table.
- [ ] Error states (DB unreachable, slow query) render gracefully.

### 6. Audit & safety

- [ ] Destructive actions ask for confirmation.
- [ ] Confirmation dialogs cancel cleanly on Esc and on backdrop click.
- [ ] Toast errors surface API messages, not raw stack traces.

---

## Project 3 — The Matrix (this repo)

### 1. Auth & access control

- [ ] Unauthenticated request to any non-public route → 307 redirect to
      `/login`.
- [ ] Authenticated user without `is_superadmin` and without
      `is_matrix_admin` → redirected to `/unauthorized`.
- [ ] User with `is_matrix_admin = true` can use the full app.
- [ ] User with `is_superadmin = true` can use the full app.
- [ ] Sign-out from the sidebar clears session and blocks the next protected
      navigation.
- [ ] Direct hits to `/login`, `/auth/callback`, `/unauthorized` are public.

### 2. App shell & navigation

- [ ] Sidebar collapse / expand on desktop persists during session.
- [ ] Mobile hamburger opens overlay, closes on backdrop or nav-link click.
- [ ] Active nav indicator follows the current route, including nested
      `/flavors/:id` and `/flavors/:id/edit`.
- [ ] Breadcrumbs render correct chain on flavors index → detail → edit.
- [ ] Theme toggle (light / dark / system) persists across reloads.
- [ ] Command palette opens with Cmd+K (Mac) and Ctrl+K (Windows/Linux).
- [ ] Command palette filters by label and keywords; ↑/↓/Enter/Esc all work.
- [ ] Sidebar "Search…" button also opens the palette.

### 3. Dashboard

- [ ] Total flavor count and total caption count match the database.
- [ ] Quick-action cards link to the right routes.
- [ ] 30-day captions chart renders for empty, sparse, and dense data.
- [ ] Recent flavors list shows the five most recent and links each to detail.
- [ ] Empty state (no flavors yet) shows a "Create your first flavor" CTA.

### 4. Flavor CRUD

- [ ] Flavors index lists every flavor with step count and creation date.
- [ ] Search input filters by slug and by description.
- [ ] `/` keyboard shortcut focuses the search input outside text fields.
- [ ] "New Flavor" navigates to `/flavors/new`.
- [ ] Inline create on the detail page (after redirect with `?new=true`)
      auto-opens the first step form.
- [ ] Edit a flavor inline from the detail page → saves and refreshes.
- [ ] Edit a flavor on the dedicated edit page → saves and stays on edit.
- [ ] Delete from the detail page asks for confirmation, then routes back
      to `/flavors`.
- [ ] Slug validation: empty slug is rejected with a clear message.
- [ ] Duplicate-slug attempt at the DB layer surfaces a friendly error.

### 5. Pipeline authoring (steps)

- [ ] Add a step from the inline form on flavor detail.
- [ ] Add a step from the New Flavor builder on `/flavors/new`.
- [ ] Load Starter Pipeline preset — populates 3 steps with the celebrity →
      description → caption chain.
- [ ] Load Columbia Roast Loop preset — populates 5 steps including critic.
- [ ] Required selects (model, input type, output type, step type) all
      validated client-side.
- [ ] Temperature input is enabled only when the chosen model supports it.
- [ ] Available "earlier step output" tokens render only for the steps that
      come before the current one (`${step1Output}`, `${step2Output}`, …).
- [ ] Common runtime variables (`${imageAdditionalContext}`,
      `${tenRandomTerms}`, …) inject at the cursor in the focused prompt.
- [ ] Edit an existing step inline — persists, list refreshes.
- [ ] Delete a step asks for confirmation, then removes from the list.
- [ ] Drag-and-drop reorder updates `order_by` for all reordered rows in a
      single API call.
- [ ] Reorder failure rolls the UI back to the previous order and toasts.
- [ ] Reorder a single step from middle to top, top to bottom, edge to edge.
- [ ] Show / Hide prompts toggles the long-form view per step.

### 6. Flavor duplication

- [ ] Duplicate from the flavors index — creates `<slug>-copy`, increments
      to `-copy-2`, `-copy-3`, … if collisions exist.
- [ ] Duplicate from the flavor detail page — same behavior.
- [ ] Duplicate copies every step with the same `order_by`, prompts, model
      ids, and types.
- [ ] If step insert fails, the new flavor is rolled back (no orphan).
- [ ] Duplicated flavor opens at its detail page and lists its steps.

### 7. Captions browser

- [ ] Captions list loads with the most recent first.
- [ ] Pagination buttons enable / disable correctly at first and last page.
- [ ] Numeric pagination collapses with ellipses past 7 pages.
- [ ] Filter by flavor pill restricts the list and resets to page 1.
- [ ] "All" pill clears the filter.
- [ ] Captions with missing image URLs render a placeholder, not a broken
      `<img>`.
- [ ] Captions with `caption_request_id` / `llm_prompt_chain_id` show the
      corresponding metadata pills.
- [ ] Empty state ("No captions found for this filter") renders.

### 8. Test Flavor (live pipeline)

- [ ] Page loads with all flavors in the dropdown and all study sets in the
      set selector.
- [ ] `/test?flavor=:id` deep-link pre-selects the right flavor.
- [ ] Upload mode: pick an image, see preview, run pipeline end-to-end:
  - `generate-presigned-url`
  - `PUT` upload
  - `upload-image-from-url`
  - `generate-captions`
- [ ] Drag-and-drop upload works the same as picker.
- [ ] Object URL for the preview is revoked on file change and on unmount
      (no memory leak across multiple uploads).
- [ ] Study Set → Single mode: pick a set, pick an image, run.
- [ ] Study Set → Batch mode: run the entire set:
  - status pills cycle pending → processing → done / error per image
  - progress message shows `Processing N/M images...`
  - concurrency is capped (no thundering herd on the API)
  - per-image errors do not stop the batch
- [ ] Generated captions render with copy-to-clipboard buttons.
- [ ] Pipeline progress stepper shows correct stage at each transition.
- [ ] Auth failure (no Supabase session) surfaces a clean error.
- [ ] External API 4xx / 5xx surfaces the message instead of failing silently.

### 9. API contract

- [ ] `GET /api/flavors` returns ordered list, newest first.
- [ ] `POST /api/flavors` rejects empty slug with 400.
- [ ] `GET /api/flavors/:id` returns 404 for missing.
- [ ] `PUT /api/flavors/:id` updates and returns the row.
- [ ] `DELETE /api/flavors/:id` removes and returns success.
- [ ] `GET /api/flavors/:id/steps` is ordered by `order_by` ascending.
- [ ] `POST /api/flavors/:id/steps` auto-assigns next `order_by`.
- [ ] `PUT /api/flavors/:id/steps/:stepId` only touches matching flavor.
- [ ] `DELETE /api/flavors/:id/steps/:stepId` only touches matching flavor.
- [ ] `POST /api/flavors/:id/steps/reorder` rejects empty arrays.
- [ ] `POST /api/flavors/:id/duplicate` rejects non-numeric ids.
- [ ] `GET /api/stats/captions-over-time` returns a 30-day grouped series.
- [ ] All routes return `{ success, data?, error? }` shape and never leak
      raw DB error messages with table names in production.

### 10. Cross-cutting

- [ ] Cmd+K command palette closes on Esc.
- [ ] Toast notifications stack and dismiss without piling up.
- [ ] Page transitions animate without flashing unstyled content.
- [ ] No console errors on each route in a clean session.
- [ ] No `any` leaks producing runtime crashes (smoke through tsc).

---

## Cross-app integration

These are end-to-end loops that span more than one app. They are the highest-
value pathways because a regression in any single app shows up here.

1. **Author → Run → Inspect**
   - Matrix admin creates a new flavor in The Matrix with the starter pipeline.
   - Same admin opens Test Flavor and runs the new flavor on a study set.
   - Generated captions appear in the Matrix Captions browser, filterable by
     the new flavor.
   - Same captions also appear in the Admin Area's caption review surface.
   - A regular consumer in the Caption App can also generate against the new
     flavor (if it's exposed to consumers) and see captions tied back to the
     same flavor id.

2. **Role grant → Access**
   - Superadmin in the Admin Area sets `is_matrix_admin = true` on a user.
   - That user signs in to The Matrix successfully.
   - Superadmin revokes `is_matrix_admin`; the user's next Matrix navigation
     redirects to `/unauthorized`.

3. **Study set → Pipeline test**
   - Admin uploads a new image into a study set in the Admin Area.
   - The image immediately appears in The Matrix's Test Flavor study-set
     selector for that set.
   - Running the flavor on that image produces captions that appear in both
     Matrix and Admin caption views.

4. **Duplication safety**
   - Duplicate a flavor in The Matrix.
   - Modify the duplicate's steps.
   - Confirm the original flavor's steps are unchanged in both Matrix and any
     admin-side surface that shows them.

5. **Sign-out propagation**
   - Sign out from any one of the three apps.
   - Confirm that the shared session is cleared in the others on next load.
