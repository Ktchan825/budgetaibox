# BudgetAIBox website

Rebuild of [budgetaibox.com](https://budgetaibox.com): a static, light-theme landing page with an animated
"glowing words" background, EN / 繁中 copy, and a working pre-order flow. No build step, no dependencies.

```
index.html            page markup
styles.css            light theme
js/config.js          ← product facts, price, links, reviews (edit this first)
js/i18n.js            all copy, English + Traditional Chinese
js/main.js            language switch, spec/review rendering, pre-order form
js/word-field.js      Canvas 2D background animation
api/preorder.js       Vercel serverless function behind the pre-order button
docs/ANIMATION-RESEARCH.md  Three.js vs particles.js vs tsParticles vs Canvas, and why
```

## Before going live — fill these in

1. **`js/config.js`** — every value marked `TBC` (storage, CPU, AI acceleration, networking, power,
   warranty, `shipWindow`) and `githubUrl` if you have a public repo. `batchSize` is hidden unless set.
2. **Comparison table** (`index.html`, `#compare`) — competitor prices are list prices as of 2026; double-check them.
3. **Reviews** — add only real, linkable reviews to `reviews` in `js/config.js`. Until then the page says so honestly.

## Deploy on Vercel

1. Push this repo to GitHub and import it at vercel.com/new (framework preset: **Other**, no build command).
2. In **Project → Settings → Environment Variables**, set at least one of:
   - `STRIPE_PAYMENT_LINK` — a Stripe Payment Link for the $20 deposit (`https://buy.stripe.com/...`).
     Visitors are redirected there with their email prefilled.
   - `PREORDER_WEBHOOK_URL` — any URL that accepts a JSON POST (`{email, updates, lang, createdAt}`):
     Zapier/Make webhook, Google Apps Script web app writing to a Sheet, Slack incoming webhook, etc.

   If neither is set, the button shows an error and asks the visitor to email you, so no sign-up is lost without anyone knowing.
3. **Domains** → add `budgetaibox.com`, then point DNS at Vercel from your registrar
   (currently the domain doesn't resolve at all).

## Run locally

```bash
npx vercel dev        # serves the page + /api/preorder
# or, static only (pre-order will show the error state):
python3 -m http.server 8000
```

Append `?lang=zh` or `?lang=en` to force a language.

## How the persona feedback was addressed

| Feedback | Change |
|---|---|
| Pre-order button gave no feedback / didn't navigate | Real endpoint, loading spinner, success / redirect / error states in an `aria-live` region, email fallback |
| Specs and price buried below the fold | Spec chips + price + refund terms in the hero, "At a glance" strip directly below, sticky section nav |
| No reviews | Reviews section with an honest empty state and a press-unit offer; renders real reviews from config |
| No docs / GitHub / pricing for developers | Developer docs section (SSH, Ollama, OpenAI-compatible API) and a single transparent pricing card; GitHub link shown when set |
| Hype, countdown, limited-quantity urgency | Removed. Added a "What it won't do" section and neutral wording |
| Spec text not clickable | Hero chips link to specs / docs / pricing |
| Language toggle distracting | Kept (Chinese-speaking audience) but de-emphasised; auto-detects browser language |
