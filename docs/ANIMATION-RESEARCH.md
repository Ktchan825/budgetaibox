# Background animation research

Goal: a light-theme page with a calm "words light up behind the content" background,
similar in spirit to the Claude desktop app, that never fights with the copy or slows the page.

## Options compared

| Library | What it's good at | Size (min+gz, approx.) | Fit for this site |
|---|---|---|---|
| **Canvas 2D (no library)** | Drawing text, dots, glows; full control | 0 KB | ✅ **Chosen.** Text rendering is native to Canvas 2D, so a word field costs ~4 KB of our own JS. |
| **Three.js** | Real 3D scenes, shaders, WebGL/WebGPU | ~150 KB+ | Overkill for 2D text. Text in WebGL needs SDF fonts (troika-three-text) → heavier and blurrier on a light background. Worth it later for a 3D product render of the box. |
| **particles.js** (Vincent Garreau) | Classic connected-dot particle backgrounds | ~6 KB | ❌ Unmaintained since ~2015. Don't start new work on it. |
| **tsParticles** | Maintained successor of particles.js; presets, emitters, text-mask shapes | 30–120 KB depending on bundle | Good if you want dots/links/confetti (e.g. a confetti burst after pre-order). Not built for "glowing words". |
| **Vanta.js** | Drop-in animated backgrounds (waves, net, fog) on top of Three.js/p5 | Three.js + ~15 KB | Quick, but looks generic and pulls in Three.js. |
| **OGL** | Tiny WebGL library (Three.js-like API) | ~25 KB | Good middle ground if we ever need shaders (e.g. a grain/gradient mesh). |
| **GSAP** (free for all use since 2025) | Timeline + scroll animations for DOM elements | ~25 KB core | Great for section reveals; we use a ~15-line IntersectionObserver instead to stay dependency-free. |
| **Lenis** | Smooth scroll | ~4 KB | Optional polish; skipped (smooth-scroll hijacking can annoy "careful researcher" users). |

## Decision

- **Background:** custom Canvas 2D "word field" (`js/word-field.js`).
  - A loose grid of AI/privacy terms (EN + 繁中) drawn at ~7% opacity in a monospace font.
  - Every ~120 ms a few random words "breathe": fade up to the accent color with a soft glow, hold, fade out.
  - Words near the cursor brighten slightly (desktop only).
  - Pauses when the tab is hidden, caps DPR at 2, and **renders a static frame when the user
    has `prefers-reduced-motion` turned on**.
- **Section reveals:** none (removed in the redesign; see the update below). The hero has one CSS load sequence.
- **No WebGL, no runtime dependencies** → fast first paint, nothing to break, trivially hostable on Vercel.

## Update: Motion (motion.dev) and GSAP, studied for the redesign

| | Motion (formerly Framer Motion) | GSAP (+ ScrollTrigger) |
|---|---|---|
| Works without React? | Yes: `animate()`, `scroll()`, `inView()` from the `motion` package | Yes, vanilla-first |
| Size for what we'd use | `inView` ~0.5 KB, `animate` low single-digit KB | core ~25 KB, ScrollTrigger extra |
| What it would buy us here | A staggered hero entrance, reveal-on-scroll | Same, plus scroll-scrubbed timelines |

**Decision: no animation library for now.**

- The page already has one authored moment: the canvas word field. Hallmark, Impeccable and
  Anthropic's frontend-design skill all say one orchestrated moment beats scattered effects,
  and the modern-minimal genre ships with section reveals off.
- The only other motion is the hero load sequence (4 elements, 8 px rise, ≤ 400 ms total),
  which Hallmark asks to be done in CSS with a `--i` stagger. That's what `styles.css` does.
- Pulling in Motion or GSAP for that would add a dependency without adding anything a visitor sees.

Revisit if we add a product page with a real scroll story (e.g. an exploded view of the hardware):
then GSAP ScrollTrigger is the better fit, and the `gsap-*` skills in `.claude/skills/` cover it.

## If you want more later

- 3D spinning product shot: Three.js + a GLTF model of the box (load lazily, only on the hero).
- Celebration after a successful pre-order: `@tsparticles/confetti` (~30 KB), loaded on demand.
