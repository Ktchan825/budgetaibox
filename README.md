# BudgetAIBox website

Rebuild of [budgetaibox.com](https://budgetaibox.com): a static, light-theme landing page with an animated
"glowing words" background, EN / 繁中 copy, and a working pre-order flow. No build step, no dependencies.

```
index.html            page markup
tokens.css            design tokens (colour, type, space, motion), all OKLCH
styles.css            page styles; references tokens only
js/config.js          ← product facts, price, links, reviews (edit this first)
js/i18n.js            all copy, English + Traditional Chinese
js/main.js            language switch, spec/review rendering, pre-order form
js/word-field.js      Canvas 2D background animation
api/preorder.js       Vercel serverless function behind the pre-order button
docs/ANIMATION-RESEARCH.md  Three.js / particles.js / tsParticles / Motion / GSAP, and why none are used
.claude/skills/       design skills for Claude Code sessions (see CLAUDE.md for order and rules)
```

## Before going live — fill these in

1. **`js/config.js`** — every value marked `TBC` (storage, CPU, AI acceleration, networking, power,
   warranty, `shipWindow`) and `githubUrl` if you have a public repo. `batchSize` is hidden unless set.
2. **Comparison table** (`index.html`, `#compare`) — competitor prices are list prices as of 2026; double-check them.
3. **Reviews** — add only real, linkable reviews to `reviews` in `js/config.js`. Until then the page says so honestly.

## Deploy on Vercel (GitHub Actions → existing project)

`.github/workflows/deploy.yml` deploys with the Vercel CLI into your **existing** Vercel project, replacing
whatever the old repo deployed. Pushes to `main` go to production; pull requests get a preview URL comment.
`vercel.json` pins framework/build/output settings, so the old project's dashboard build settings
(e.g. a Next.js build command) are overridden and don't need changing.

1. Add two repository secrets (GitHub → Settings → Secrets and variables → Actions):
   - `VERCEL_TOKEN` — create at vercel.com/account/tokens (scope it to the account/team that owns the project)
   - `VERCEL_PROJECT_ID` — Vercel → Project → Settings → General → Project ID (the project name also works)
   - `VERCEL_ORG_ID` is optional; the workflow looks it up from the project automatically.
2. Optional but recommended: Vercel → Project → Settings → **Git** → **Disconnect** the old repo,
   so the old repo can't push deployments over this one.
3. Merge to `main` (or run the workflow manually from the Actions tab).

Only have the Vercel account, not the old project? Create a new project from this repo at vercel.com/new
instead and move the `budgetaibox.com` domain to it.

### Environment variables

1. In **Project → Settings → Environment Variables**, set at least one of:
   - `STRIPE_PAYMENT_LINK` — a Stripe Payment Link for the HK$99 deposit (`https://buy.stripe.com/...`). Set its after-payment redirect to `https://budgetaibox.com/?reserved=1` so visitors see the confirmation message. The amount must match `deposit` in `js/config.js`.
     Visitors are redirected there with their email prefilled.
   - `PREORDER_WEBHOOK_URL` — any URL that accepts a JSON POST (`{email, updates, lang, createdAt}`):
     Zapier/Make webhook, Google Apps Script web app writing to a Sheet, Slack incoming webhook, etc.

   If neither is set, the button shows an error and asks the visitor to email you, so no sign-up is lost without anyone knowing.
2. **Domains** → add `budgetaibox.com`, then point DNS at Vercel from your registrar
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
| Specs and price buried below the fold | Price, deposit, memory, software, data policy and ship date in a spec sheet beside the headline; floating section nav |
| No reviews | Reviews section with an honest empty state and a press-unit offer; renders real reviews from config |
| No docs / GitHub / pricing for developers | Developer docs section (SSH, Ollama, OpenAI-compatible API) and a single transparent pricing card; GitHub link shown when set |
| Hype, countdown, limited-quantity urgency | Removed. Added a "What it won't do" section and neutral wording |
| Spec text not clickable | The hero spec sheet links to the full specification table |
| Language toggle distracting | Kept (Chinese-speaking audience) but de-emphasised; auto-detects browser language |
