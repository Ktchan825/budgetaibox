# BudgetAIBox site

Static landing page for a $289 private AI server (pre-orders, $20 refundable deposit).
Plain HTML/CSS/JS, no build step. Deployed to Vercel by `.github/workflows/deploy.yml`
(push to `main` = production, PRs = preview). See README.md for setup.

## Files

- `js/config.js`: product facts, price, links, reviews. Single source of truth; `TBC` = not confirmed by the owner.
- `js/i18n.js`: all copy, `en` and `zh` (Traditional Chinese, written register). Every key must exist in both.
- `tokens.css`: design tokens (OKLCH). `styles.css` references tokens only; no raw colour or font values.
- `js/word-field.js`: the canvas background (glowing words). It is the page's one bold element.
- `api/preorder.js`: Vercel function behind the reserve form.

## Design skills: order and rules

Skills live in `.claude/skills/`. Use them in this order, and don't mix the ones marked as conflicting:

1. **hallmark** sets direction (new pages, redesigns, audits). Do not load it together with UI/UX Pro Max.
2. **frontend-design**: light use, as a second check on Hallmark's choices.
3. **impeccable** polishes and audits, always after Hallmark. Its launcher binary (`scripts/impeccable`)
   is intentionally **not installed**: it downloads an unreviewed binary. Use the skill's documented
   "Launcher unavailable" fallback (read `reference/*.md` directly). Don't fetch or install the launcher.
4. **Animation last**: `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger` only if a real scroll story needs it.
   Current decision (docs/ANIMATION-RESEARCH.md): no animation library; one CSS hero load sequence.
5. **humanizer** for English copy. Chinese copy follows the same intent (no filler, no dramatic fragments).
6. **ponytail / ponytail-review / ponytail-audit** when reviews disagree: keep the code simple.

Design reference: one DESIGN.md per brief. Current reference is `ollama` from
VoltAgent/awesome-design-md (docs-first, monochrome, one signal colour), adapted, not copied:
no Ollama mascot, logo or fonts. The current build is stamped at the top of `styles.css` and logged in
`.hallmark/log.json`.

## Content rules

- Never invent reviews, testimonials, metrics or specs. Unknown values stay `TBC` in `js/config.js`.
- No countdowns or fake scarcity. `batchSize` stays `null` unless the owner gives a real number.
- Competitor prices in the comparison table are list prices; re-check them when editing that table.

## Before pushing

- Serve locally (any static server; `/api/preorder` needs `vercel dev` or a small Node wrapper) and check
  320 / 375 / 414 / 768 / 1366 px in both languages: no horizontal scroll, no two-line buttons, no console errors.
- Test the form: invalid email, endpoint not configured (error message offering the contact email), Stripe redirect.
- `node --check` on every file in `js/` and `api/`.
