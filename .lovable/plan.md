# Lead CRM Cloud upgrade plan

## Outcome
Extend the existing CRM—not rebuild it—with shared Lovable Cloud accounts and data, strict admin/intern isolation, the 14 admin/intern capabilities in the uploaded brief, a stable responsive layout, and the exact uploaded Pixel Infinite AI logo.

## Implementation
1. **Cloud identity and access:** Replace browser-only sign-in with verified email/password accounts. Bootstrap the first Founder using the CRM's existing configured email (`admin@pixelinfinite.ai`); Founder-created intern accounts use email invitations. Store role membership only in a protected `user_roles` table; keep user-facing profile and intern roster details separate. Add database policies for all reads and writes, enforcing Founder-wide access and intern-only assigned-lead access even for direct requests.
2. **Shared CRM data:** Add additive, RLS-protected Cloud tables for intern roster/permissions, leads, activities/audit events, follow-ups, work sessions, and team settings. Preserve existing screens and business behavior while replacing local-only reads/writes with authenticated Cloud access. Provide a Founder-only one-time import of the current browser's CRM records; retain local data until import succeeds, and link invited accounts to matching roster emails.
3. **Admin + intern workspaces:** Extend existing CRM sections with command-center status/workload, editable intern permissions, full timestamped audit/activity history, assignment and bulk assignment, performance/lead-health metrics, synchronized updates and alerts, account activation, personal lead actions, next-step guidance from each intern's own history, follow-up task views, smart notes, and private progress. Enforce ownership in the database, not just the interface.
4. **Visual updates:** Fix viewport sizing and overflow without changing the established navy/gold identity. Use the uploaded logo unchanged on login, Founder dashboard, and intern dashboard, and set its padded square favicon.
5. **Verification:** Apply and inspect migrations and policies; test signed-in Founder and intern flows, including denied cross-intern direct access, admin actions, import, live updates, and desktop/tablet/mobile sizing. Run the project checks and inspect the latest preview diagnostics.

## Assumptions
- Use the saved Founder email `admin@pixelinfinite.ai` for the initial verified Founder account because no replacement email was provided.
- The current browser's local CRM data remains available for the Founder to import; passwords and local pseudo-sessions are not migrated as credentials.
- New intern accounts are created by Founder invitation and activate only after email confirmation.

## Technical decisions
- Use TanStack Start server functions for protected app operations and the existing browser Cloud client only for RLS-scoped operations and realtime subscriptions.
- Keep roles in a separate `user_roles` table and use server-validated role checks plus narrowly scoped row-level policies; never trust browser storage for access control.
