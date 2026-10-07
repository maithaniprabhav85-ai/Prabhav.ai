<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Extend CRM features through focused components backed by the existing context and localStorage data model, so established pages and behavior remain stable.
- Use authenticated Lovable Cloud tables and row-level policies as the source of truth for shared CRM records; retain local storage only as a one-time migration source, because browser storage cannot enforce intern isolation or synchronize team changes.
