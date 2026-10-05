# CRM Additions Plan

## Scope guard
- Keep all existing authentication, credentials, routes, records, navigation, colors, and CRM behavior intact.
- Do not use the uploaded logo: the requested login change explicitly leaves the top-left brand spot empty.
- Add features through small focused components and minimal connection points only; add no dependencies.

## Changes
1. **Login page**
   - Remove only the small top-left logo.
   - Increase the four left-side feature icons, titles, subtitles, and spacing.
   - Leave the login card and all sign-in behavior untouched.

2. **Full-screen app shell and premium white surfaces**
   - Make the signed-in shell fill the viewport, with a fixed desktop sidebar and the content using all remaining width.
   - Apply the requested subtle white-to-off-white background, soft layered card/table shadows, 1px borders, rounded corners, padding, restrained typography, and smooth row/button transitions without changing the existing color palette.

3. **Follow-up calendar and overdue visibility**
   - Add a reusable month calendar component beside the existing list view, with previous/next month controls and date counts.
   - Add overdue badges to due leads.
   - Add an overdue total to the Dashboard and Follow-ups sidebar item.

4. **Lead quick actions**
   - Add a reusable WhatsApp, Call, and Email action group to each lead row and company details.
   - Open `wa.me`, `tel:`, and `mailto:` links with the requested WhatsApp message.
   - Record each click in the existing local activity history.

5. **CSV import/export and duplicate checks**
   - Add Export CSV for the currently filtered lead list.
   - Add an Import CSV flow with upload, preview, column mapping, and import.
   - Detect duplicate phone, email, or company on import and Add Lead; show Skip and Import anyway choices before saving.

6. **Leaderboard targets**
   - Add a Leaderboard tab to Admin with leads handled, converted count, on-time follow-ups, and editable monthly targets stored locally.
   - Add the signed-in intern’s own target progress card to their Dashboard only.

## Verification
- Check admin and intern sign-in, role visibility, add/import duplicates, filtered export, quick-action activity logging, calendar counts, targets, and overdue totals.
- Verify desktop, tablet, and mobile layouts and confirm the latest preview build has no errors.
