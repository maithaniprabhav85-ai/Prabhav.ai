# LeadPilot CRM Feature Expansion Plan

## Scope and safety boundary
- Preserve the existing CRM pages, login, data, localStorage model, and navigation; add focused sections/components only.
- Per the user's choice, keep browser-only accounts and storage. Do not add Cloud authentication, backend tables, or server features. Explain that browser-only storage cannot enforce intern privacy/admin authorization against direct access or synchronize across devices.
- No genuine background scheduler is configured for the current browser-only approach. Make the requested 10-day cadence persistent and shared within the existing local CRM dataset using stored release dates and date-based eligibility; never describe it as a background job.
- Avoid dummy analytics: compute from existing actual CRM data. Do not claim browser-side visibility checks are security enforcement.

## Staged implementation
1. **Shared local feature state**
   - Extend the existing CRM data with additive, defaulted local structures for theme preferences, feature catalog/control/release settings, per-account preferences, personal notes/tasks/saved filters, and feature actions where appropriate.
   - Normalize missing legacy fields on load; do not replace or reset existing records.
   - Keep admin and intern presentation branches distinct while noting local-only access limitations.
2. **Navigation and theme management**
   - Add focused navigation entries for Advanced Admin Tools, My Productivity Tools, and New Features while retaining all existing links.
   - Implement admin theme presets/custom color editor with draft preview, save/reset, and named local presets; implement intern approved theme selection and personal preference separately.
3. **Admin tools**
   - Add a dedicated Advanced Admin Tools workspace with data-derived analytics/performance comparisons, lead assignment/bulk operations, audit activity views, automation configuration/status, and feature access controls.
   - Only claim rules that are actually connected to existing local behaviors; scheduled/background actions must be labeled unavailable unless a real scheduler is configured.
4. **Intern productivity**
   - Add the seven requested intern tools as separate focused views backed by the existing local CRM data: personal metrics, lead notes, follow-up planning, private-in-this-browser tasks, duplicate review, personal reports, and saved filters.
   - Preserve existing leads/follow-ups workflows and avoid duplicate follow-up records.
5. **Feature discovery and release cadence**
   - Add role-specific New Features views and a shared catalog with approval/global availability and per-intern activation choices.
   - Use a configurable stored start date and 10-day date arithmetic for common release eligibility; pause/resume and feature controls persist locally. New releases append rather than replace features, with deduplication.
6. **Verification and reporting**
   - Verify type/build diagnostics, preserve current preview health, and test navigation and data-derived behavior in the browser where possible.
   - Report implemented pieces, local-only security limits, absence of a real scheduler, and any unverified sign-in-required flows honestly.

## Technical details
- Existing architecture: TanStack Start / React, CRM context and localStorage (`intern-lead-crm-v1`), seeded data, existing typed Supabase tables but currently-unused for CRM UI state.
- Do not switch to the backend after the user chose browser-only; do not edit generated integration files or database schema.
- New local structures should be optional/additive in loading and defaulted to preserve existing saved browser data.
- Add rule tests for the explicit 10-day release interval and deduplication of release batches, using concrete date values.
