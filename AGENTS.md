# Article authoring

- Articles are bilingual pairs: `content/posts/<slug>/index.md` is Simplified Chinese and `index.en.md` is English. They share one slug, publication date, tags, categories, cover, and `imgs/` directory.
- When asked to write or revise an article, complete both language versions in the same change. Keep titles, subtitles, summaries, facts, examples, and section order aligned. Do not substitute a shortened English summary for a full translation.
- Translate directly in the current AI workflow. Do not send article content to external translation services unless the user explicitly authorizes the destination.
- Keep executable code and resource/link destinations consistent. Translate explanatory prose, headings, image descriptions, and text-only diagrams; preserve technical identifiers.
- `pnpm new:post` creates both files and a synchronization snapshot. Its English placeholder starts as `translation-status: draft`. Finish and review the translation, then set it to `published`; never publish placeholder text.
- After reviewing both versions, run `pnpm sync:translations --slug <slug>` to update `translations.json`. This command records the review; it does not translate or prove semantic equivalence. Never update the snapshot merely to silence a failure.
- Run `pnpm check:translations` after article changes. The production build also runs this check and rejects missing English files, unreviewed changes to either file, conflicting shared metadata, or mismatched heading structure.
- Existing articles without a published English file fall back to Chinese. New completed article work should include a published English version.
