English condensed translation of docs/growth/lp-plano.md.

# Landing Page Plan — deskcomm.com.br

> Content, layout, narrative and art-direction plan. **Not code.**
> Locked decisions: hero **The Living Desk** · **business-owner** axis with parallel tracks for devs · HostGator banner **rebuilt responsive** with their branding preserved.

---

## 0. The tension that needs a decision first

`docs/design-system/07-motion-language.md` explicitly forbids:

> ❌ **Decorative parallax.** Hero scroll with 3 layers moving at different speeds. Doesn't fit soft-tech.

Yet you asked for layers with scroll motion. Not a contradiction: **that document governs the app**, where operators spend 8 hours and gratuitous motion becomes fatigue. A sales page is a different artifact with a different job.

**Proposed reconciliation**, keeping the document's spirit. Its first test is: *"Can I explain what this animation communicates in one sentence? If the answer is 'it looks nice', remove it."*

So the LP rule is: **a moving layer must be explaining the product.** The lead crosses the desk because **that's what a lead does**. The agent piece lights up when its turn starts because **that's when it acts**. Depth for depth's sake — three planes sliding at different speeds for a 3D feel — stays forbidden here too.

| Allowed on the LP | Still forbidden |
|---|---|
| A layer moves because it represents a real system step | A layer moves to give a sense of depth |
| State changes when scroll reaches the point that explains it | Element fades in just because it entered the viewport |
| Motion has a start and end tied to a product fact | Continuous decorative background motion |

**✅ APPROVED by Rafael on 07/27/2026.** Becomes a new document — `docs/design-system/10-landing-motion.md` — declaring the scope. So it is a registered extension of the doctrine, not a silent violation. `09-anti-patterns.md` itself says anti-patterns are the design system's memory bank and are updated by PR.

---

## 1. Page strategy

### The funnel, and why it isn't linear

The three goals are not a sequential funnel — they are **three exits** the same page serves for different people:

| Goal | Who | Where the page offers it |
|---|---|---|
| ⭐ Repo star | dev / technical evaluator | header, proof block, footer |
| 📦 VPS install | technical person or reseller | sections 9 and 10, persistent CTA |
| 💳 VPS subscription | business owner | final banner + hero CTA |

The main narrative speaks to **the business owner**: they pay for the VPS, and the page is in pt-BR. Devs aren't ignored — they get a whole block built for their skepticism (§7) — but it doesn't hijack the story.

### Golden content rule

Each section answers **one** question the visitor really has, in this order: *what is this? · why should I care? · does it really work? · does it fit my case? · how do I start? · how much does it cost?*

A section that answers none of them is cut.

---

## 2. Non-negotiable constraints

**Design system** (`09-anti-patterns.md`):
Atkinson Hyperlegible + IBM Plex Mono · no Inter/Geist · **no purple/blue/pink gradient** · solid Sage `#67885d` primary button · no glassmorphism · Phosphor duotone (never Lucide, never the Sparkles icon for AI — use `Brain`) · `#faf9f6` background, never pure white · shadows `rgba(20,18,14,X)`, never pure black · no `transition: all`.

**GEO** (research of 07/27):
Server-side rendering is mandatory — **no AI crawler executes JavaScript**. All text content exists in the served HTML; scrollytelling is a layer on top. `<html lang="pt-BR">`, `og:locale=pt_BR`, hreflang in `<head>`. Visible last-updated date.

**Performance:**
Layers animate only `transform` and `opacity` (GPU). Images in AVIF with WebP fallback. Only the hero gets load priority; the rest is lazy. Budget: LCP < 2.5s on 4G.

**Accessibility:**
`prefers-reduced-motion` falls back to each scene's static end state — the page still tells the whole story with zero motion. Every image has `alt` describing the **fact**, not the aesthetics.

---

## 3. Page structure

```
HEADER (sticky, thin)
 ├─ 1. HERO — The Living Desk
 ├─ 2. The problem — two named villains
 ├─ 3. The turn — Living Commercial Operating System
 ├─ 4. SCROLLYTELLING — The life of a lead        ◄ centerpiece
 ├─ 5. How the system thinks — the agent's turn   ◄ 3D exploded view
 ├─ 6. Nothing dies — Radar and follow-up
 ├─ 7. Proof — technical block (dev track)        ◄ star CTA
 ├─ 8. One core, N niches
 ├─ 9. For those installing for clients
 ├─ 10. Installation — one command
 ├─ 11. What it costs — honesty as an argument
 ├─ 12. Citable FAQ
 ├─ 13. HostGator BANNER (rebuilt)                ◄ VPS conversion
FOOTER
```

---

## HEADER

Thin, sticky, `#faf9f6` background with a 1px `border-bottom` that appears only after 40px of scroll.

```
[■ DeskcommCRM]     How it works · Proof · Install · Pricing      [GitHub ⭐] [Install on a VPS]
```

- `[GitHub ⭐ 116]` — secondary, ghost, **with live counter**. Rafael's decision, against my initial recommendation and with a better argument: 116 for a 3-month-old Brazilian CRM reads as real traction, not a hobby — the ~1k benchmark in the research is for English-language infrastructure projects, a different market. The number is fetched from the GitHub API and cached; never hardcoded (hand-written social proof rots and understates reality).
- `[Install on a VPS]` — solid Sage primary.
- Mobile: logo + primary button; the rest becomes a menu.

---

## 1. HERO — The Living Desk

### The concept

The product name turned into an image. **Deskcomm = Desk + comm — the desk-based commercial operation.** The hero is an isometric desk seen from above, where the entire commercial operation is **one surface**: conversation, pipeline, agent, follow-up — distinct pieces joined by visible trails.

Why this and not another: it's the only image on the page that **no competitor can use**, because it comes from the etymology of your name. A generic CRM can show a kanban. None can show "the desk".

And it carries the thesis without saying it: if everything is on the same desk and the pieces are connected, **nothing falls on the floor**. The "living system" as a visual fact, not an adjective.

### Layout

Asymmetric, not centered. Copy on the left (~42%), desk on the right bleeding past the margin — suggesting it continues beyond the screen.

```
┌──────────────────────────────────────────────────────────────┐
│  Desk + comm                                                  │
│  ─────────────                            ╱▔▔▔▔▔▔▔▔▔╲        │
│                                        ╱   ▢     ▢   ╲       │
│  Your sales operation                  │  ╲   ╱ ╲   ╱ │      │
│  on one desk.                          │   ▢─────▢    │      │
│  And nothing dies on it.               │  ╱   ╲ ╱   ╲ │      │
│                                        ╲   ▢     ▢   ╱       │
│  AI agents answer on WhatsApp,          ╲▁▁▁▁▁▁▁▁▁▁▁╱        │
│  qualify and move the pipeline — on                           │
│  your server, no subscription.         ● lead arrives         │
│                                                               │
│  [Install on a VPS]  [View on GitHub]                        │
│  MIT · no paid plan · runs on 2 GB                           │
└──────────────────────────────────────────────────────────────┘
```

### Copy

> **Eyebrow:** `Desk + comm — the desk-based commercial operation`
>
> **H1:** Your sales operation on one desk.
> **And nothing dies on it.**
>
> **Sub:** AI agents answer on WhatsApp, qualify the lead and move the pipeline — everything recorded and auditable. On your server, no per-user fees.
>
> **Primary CTA:** Install on my VPS
> **Secondary CTA:** View the code on GitHub
> **Microcopy:** MIT license · no paid version · runs on a 2 GB VPS

The H1's second line anchors the category. It comes from the doctrine (`sistema-vivo.md`) and is the one promise on this page competitors **can't repeat without lying**.

### Layers and motion

Five stacked PNGs, bottom to top:

| # | Layer | Behavior |
|---|---|---|
| 1 | Desktop (shadow + surface) | static |
| 2 | Connection trails between pieces | light up in sequence on entry (once) |
| 3 | Pieces: conversation, pipeline, agent, follow-up, log | static |
| 4 | Floating piece labels | fade + 8px rise, 50ms stagger |
| 5 | The lead (a sage dot) | travels the trail from conversation to pipeline |

**Scroll motion:** the camera does **no** depth parallax. It does one explainable thing: as scroll goes down, the desk **tilts slightly** (from ~18° to ~12° isometry), like leaning in for a closer look. One sentence: *"you're getting closer to the desk"*. It's the transition into §4, which happens **on the same desk**.

`prefers-reduced-motion`: desk at the final angle, trails lit, lead positioned midway. Whole story, zero motion.

---

## 2. THE PROBLEM — two named villains

We compare against no product. We name **two situations** the visitor recognizes in their own operation. This reframes the competitor from "another CRM" to "the way you work today" — and nobody defends how they work today.

> **Title:** You don't lose sales for lack of leads.
>
> **Villain 1 — The CRM that's a pretty spreadsheet.**
> The lead arrives, someone logs it, and nothing happens. By the time you notice, it's gone — and nobody can say when or why. The system kept the name and lost the story.
>
> **Villain 2 — The bot that answers and vanishes.**
> It replies fast, says anything, and disappears. If it promised a deadline that doesn't exist, you learn from the customer. You can't audit what it said, let alone why.
>
> **The turn:** Both share the same root: the system isn't accountable for what happens next.

Layout: two columns, each villain with a small 3D illustration (see Images: `viloes-01`, `viloes-02`). No generic icons.

---

## 3. THE TURN — Living Commercial Operating System

The category is named and — crucially — **defined by verifiable criteria**. A category without criteria is an adjective; with criteria, it's a standard.

> **Title:** A **living** commercial operating system.
>
> **Sub:** "Living" has a definition, and it is written in the repository before it's on this page. Five rules every part of the system must meet:

Five items, each with a mini-diagram and the verifiable formulation:

| # | Rule | How it's verified |
|---|---|---|
| 1 | **Nothing is an island** | every piece has input and output — the architecture map is public |
| 2 | **No lead dies undiagnosed** | stalled demand shows in Radar, classified by risk |
| 3 | **Every AI action is auditable** | 7 checks per send, each becomes a record — including the ones that block |
| 4 | **An invisible log is a dead log** | every relevant mutation becomes an on-screen timeline activity |
| 5 | **Follow-up is the anti-death** | open demand with no next step is treated as a leak |

> **Closing:** This isn't what we promise. It's the criterion a change must pass to enter the system — it's in `docs/doctrine/sistema-vivo.md`, and the seven-question checklist is answered before every merge.

---

## 4. SCROLLYTELLING — The life of a lead ◄ centerpiece

**The most important section.** Where promises become something the visitor *sees happen*.

Format: **sticky image on the right, text scrolling on the left.** As the visitor scrolls, the same desk scene changes state with each text block. One scene, seven states.

Why sticky instead of a sequence of loose images: it keeps the spatial continuity the design system values — the desk doesn't vanish and return, it **evolves**. It's the hero's desk, now up close.

### The seven beats

| # | Text (left) | Scene change (right) |
|---|---|---|
| 1 | **09:41 — a message arrives.** "Do you deliver to Salvador?" Before any reply, the system already knows who it is: history, orders, what was agreed last time. | Conversation piece lights up. A context card rises beside it with the contact's data. |
| 2 | **The agent reads before it speaks.** It searches **your company's** knowledge base — your lead time, your policy, your catalog. It doesn't invent. | Line links the agent to the knowledge base piece; documents light up in sequence. |
| 3 | **Seven checks before sending.** Opt-out, LGPD, anti-ban, text variation, deterministic promise, semantic promise, automation notice. In that order, always. | Seven small gates appear in a row. Six pass in green; **one blocks in amber** and the message goes back. |
| 4 | **Including what it decided NOT to send.** The agent was about to promise 24h delivery. The promise check blocked it: that lead time isn't in your catalog. What it was going to say and why it didn't is recorded. | Zoom on the amber gate; a record materializes with the refusal reason. |
| 5 | **The lead moves on its own.** Qualified, it changes stage in the pipeline. The tag is added, the owner is set — and every move has a recorded reason. | The lead dot travels the trail to the pipeline piece and settles into a new column. |
| 6 | **When it's the human's turn, they get context — not the raw conversation.** Summary of what happened, what was agreed, which objections came up and the next step. | Agent piece passes the baton to the human agent piece; a summary card moves between them. |
| 7 | **And if nobody answers, the system won't let it die.** Follow-up scheduled. If it cools, the lead shows in Radar classified by risk — before it becomes a loss. | Follow-up piece lights up; a timer starts; the lead gets an amber "at risk" ring. |

**Motion:** each state change is `opacity` + `transform` of a layer, triggered when the matching text block enters the viewport's central area. Nothing moves continuously. Nothing moves without the adjacent text explaining what it is.

`prefers-reduced-motion`: becomes a vertical stack — each beat with its final-state image, no sticky, no transition.

**Mobile:** sticky doesn't work well on small screens. Becomes a sequence: text, image, text, image. Same story.

---

## 5. HOW THE SYSTEM THINKS — the agent's turn

The **3D exploded view** — the piece that delivers "see how the system thinks".

> **Title:** What happens between the question and the answer.
>
> **Sub:** It's not a call to an AI model. It's a turn with steps, and each leaves a trace.

A 3D piece exploded into stacked horizontal layers, each labeled, with visible connections:

```
        ╔═══════════════════════╗
        ║  MESSAGE ARRIVES      ║
        ╚═══════════╤═══════════╝
        ╔═══════════▼═══════════╗
        ║  CONTEXT              ║  history + contact + pipeline
        ╚═══════════╤═══════════╝
        ╔═══════════▼═══════════╗
        ║  KNOWLEDGE            ║  search YOUR company's base
        ╚═══════════╤═══════════╝
        ╔═══════════▼═══════════╗
        ║  DECISION             ║  reply · move · escalate
        ╚═══════════╤═══════════╝
        ╔═══════════▼═══════════╗
        ║  7 CHECKS             ║  ◄ can veto and send back
        ╚═══════════╤═══════════╝
        ╔═══════════▼═══════════╗
        ║  SEND + RECORD        ║
        ╚═══════════════════════╝
```

**Motion:** on entering the viewport, layers separate vertically (the "explosion") **once**, in 320ms with the design system's `ease-out-slow` curve. Then they stay still. A pulse runs down the connections once, showing the path.

Worth noting: the checks layer's arrow **loops back** to the decision. It's the instructive veto — the gate doesn't just block, it returns the reason to the model. A code fact (`lib/agent-engine/guardrails/before-send.ts`) that almost no product can draw.

---

## 6. NOTHING DIES — Radar

Short, high-impact section anchoring the most sellable invariant.

> **Title:** The question no CRM answers: **how many leads are dying right now?**
>
> **Body:** Radar answers. Every open demand is classified — **critical**, **at risk**, **in flight** — by time without interaction and what's pending. Not last month's report; the state right now.
>
> **Closing:** A number on screen that doesn't change a decision is noise. This one does.

Image: 3D Radar composition with three concentric rings, leads spread by risk band.

---

## 7. PROOF — the dev block ◄ parallel track

Deliberately technical and dense. The business owner skips it; the skeptical dev stops here. Also the most LLM-citable block, since verifiable numbers live here.

> **Title:** Don't believe. Check.
>
> Four cards, each with its repository path:

| Claim | Where to check |
|---|---|
| **Isolation between customers is tested on every change.** CI spins up a clean Postgres and runs 364 invariant tests. One creates two organizations and proves neither sees any row of the other — and a control case first proves the rows exist, otherwise the test would pass on an empty table. | `tests/invariants/rls-isolation.test.ts` |
| **Seven checks before every send, in fixed, versioned order.** Each evaluation becomes a durable, exportable record — including the ones that blocked. | `lib/agent-engine/guardrails/before-send.ts` |
| **Updating doesn't break.** The update path is tested: the schema is applied to a fresh database and re-applied to an existing one, proving idempotency. | `scripts/test-db.sh` |
| **MIT, no paid version, no locked features.** What you install is the full product. | `LICENSE` |

> **Block CTA:** ⭐ Star on GitHub — *it helps others find the project.* `[116 stars]`

A clean star request, no reward. Incentivizing stars with perks violates GitHub policy — and **90.42% of repositories with fake-star campaigns were deleted**.

---

## 8. ONE CORE, N NICHES

> **Title:** The same system serves whoever sells appointments and whoever sells sneakers.
>
> **Body:** The pipeline vocabulary is configurable: *lead* becomes **Customer**, **Patient** or **Buyer**; *won* becomes **Paid**, **Booked** or **Closed**. Not a theme, not a fork, not a "clinic edition" — the same core, configured.

Light interactivity: four tabs (E-commerce · Clinic · Real estate · Services). Switching tabs swaps the labels on the same pipeline diagram. One image, four states — **not** four images.

---

## 9. FOR THOSE INSTALLING FOR CLIENTS

> **Title:** Install for your clients. With your brand.
>
> **Body:** Two `.env` variables swap the name and logo across the whole interface — without touching code, because edited code is lost on the next update. MIT license: you can modify, host for third parties and charge. No royalties.
>
> **Honesty that sells:** colors and fonts still require changing the design system, and branding is per installation, not per organization. It's all written in the guide.
>
> **CTA:** Read the guide for agencies →

Image: the same screen in two different brands, side by side.

---

## 10. INSTALLATION

> **Title:** One command. Two hours of setup. No subscription ever again.

Real, copyable code block:

```bash
git clone https://github.com/melgarafael/DeskcommCRM.git
cd DeskcommCRM/hostgator-setup-kit
bash install.sh
```

Three supporting columns:

- **2 GB of RAM is enough** — the server builds nothing, it pulls a ready image.
- **Automatic HTTPS** — certificate issued on first access.
- **Stuck? There's an assistant** — open Claude Code inside the VPS and it guides you by conversation, with nine environment pitfalls already mapped.

> ⚠️ **We promise no install time anywhere on this page.** The kit doesn't declare one and we haven't measured it. The real bottleneck is creating the database account and DNS propagation, not the script. Promising "30 seconds" is the first broken promise.

---

## 11. WHAT IT COSTS

> **Title:** The software is free. You pay for the server.
>
> **Body:** There is no paid version, no locked feature, no per-user charge. Your team grows, your bill doesn't. You pay for the VPS it runs on and the AI keys you consume.
>
> **Contrast, naming no one:** A closed platform charges per agent. Five people in sales cost five times. Here, five or fifty cost the same VPS.

No pricing table — we have no plans. One honest block.

---

## 12. CITABLE FAQ

Deliberate format (what GEO research measured as effective): **literal question as a visible H2**, direct answer in the first two sentences, a verifiable number where possible. As visible HTML — not hidden JSON-LD, which Google discontinued for FAQ.

1. How much does DeskcommCRM cost?
2. Do I need to code to install it?
3. Which VPS do I need?
4. Does it work with regular WhatsApp?
5. What type of business is it for?
6. Can I install it for my clients and charge?
7. How do I update later?
8. Does my data stay in Brazil?
9. What happens if the AI gets it wrong?
10. Do I need a credit card to try it?

#9 is the most important and almost no one answers it: *"Every message goes through seven checks before it goes out, and all are recorded — including those that blocked a send. When the agent shouldn't continue alone, it hands off to a human with a summary of what happened."*

---

## 13. HOSTGATOR BANNER — rebuilt

Rebuilt in fluid HTML (the original is a fixed 1680×600 and breaks on mobile), **keeping HostGator's visual signals** — orange `#F67922`, navy `#073f60` — as a clearly delimited **partner** block. The palette break becomes intentional rather than accidental: a full-width band with breathing room before and after, reading as "something else starts here".

Removed: **OpenClaw** and **Hermes** — unrelated to Deskcomm and dilute conversion.

> **Eyebrow:** Official partner
> **Title:** Sovereignty with AI is at HostGator
> **Body:** Datacenter in Brazil, no international data transfer. It's where DeskcommCRM was built to run.
> **CTA:** Subscribe to the VPS with the partner discount →
> **Microcopy:** partner link — subscribing through it supports the project

---

## FOOTER

Four columns + bottom bar.

| Product | Documentation | Community | Project |
|---|---|---|---|
| How it works | Installation guide | GitHub Discussions | MIT License |
| For agencies | Agency guide | Issues | Changelog |
| Pricing | Architecture | YouTube | Security |
| FAQ | Living-system doctrine | Instagram | Contribute |

Bottom bar: `DeskcommCRM · MIT · Made in Brazil` · **`Page updated on [date]`** — visible, not just in schema: research measured that **75% of AI-cited pages were updated within the last 12 months**, and the update date discriminates better than the publish date.

---

## Image inventory

**11 images.** All 3D, generated later in ChatGPT from the prompts in the next document.

| ID | Where | What it shows | Layers |
|---|---|---|---|
| `mesa-01` | Hero | The full isometric desk | 5 (top · trails · pieces · labels · lead) |
| `viloes-01` | §2 | Desk with disconnected pieces, a lead falling through the gap | 1 |
| `viloes-02` | §2 | Robot piece talking to itself, no output trail | 1 |
| `cena-01..07` | §4 | Seven states of the same close-up scene | 4 each, shared |
| `turno-01` | §5 | Exploded view of the agent's turn, 6 layers | 7 (6 layers + pulse) |
| `radar-01` | §6 | Radar with three risk rings | 3 |
| `nichos-01` | §8 | Neutral pipeline, labels as a separate layer | 2 (base + 4 label variants) |
| `marca-01` | §9 | Same screen in two brands | 1 |

**Total files:** ~28 PNGs (counting layers). In AVIF under 1.2 MB total, with only the hero loading at priority.

---

## Art direction for the 3D images

⚠️ **This is the biggest quality risk on the whole page.** Eleven images generated in different sessions become eleven styles, and the page looks like a collage. The defense is a fixed style block, pasted **identically** into every prompt, generating everything in the same session.

### Style block (paste into every prompt)

```
Isometric 3D render, 30-degree camera angle, orthographic projection.
Matte clay material — soft, slightly rough, no gloss, no chrome, no glass, no neon.
Palette strictly limited to: warm off-white #faf9f6 background, surface #ffffff,
warm greige #e7e3da for structure, desaturated sage green #506d48 for active
elements, muted amber #b8863b for warnings only. No other colors.
Soft studio lighting from upper left, long soft shadows in warm grey rgba(20,18,14,0.10).
No text, no labels, no UI chrome, no icons inside the render.
Generous empty space around the subject. Calm, precise, architectural.
Transparent background (PNG with alpha).
Style reference: architectural maquette, not videogame asset.
```

### Layer rules

Each layer is generated as a separate PNG **with alpha**, same framing and scale. To get this: generate the full scene first, then ask for each element isolated: *"same scene, same camera, same lighting, only the [X], everything else fully transparent"*.

Labels **never** go in the image — they're HTML on top. Three reasons: text in images isn't read by search engines or AI crawlers, can't be translated, and looks jagged on retina.

### Hero prompt (`mesa-01`)

```
[STYLE BLOCK]

An isometric 3D scene of a single large rounded rectangular desk surface,
floating, seen from above at 30 degrees. On the desk sit five distinct low-profile
modules connected by thin recessed channels carved into the desk surface:
1. a rounded module suggesting a conversation thread (stacked soft plates)
2. a module of four vertical columns of small tiles (a pipeline)
3. a central rounded module, slightly taller, in sage green (the agent)
4. a small circular module with a subtle ring (follow-up timer)
5. a flat wide module of thin horizontal lines (the log)
The channels connecting them are recessed grooves, sage green at the bottom.
A single small sage sphere sits at the entrance of the conversation module.
Nothing is detached; every module touches at least two channels.
```

Then one pass per layer: `tampo` (desktop), `trilhas` (trails), `peças` (pieces), `lead`.

---

## What I need from you to execute

| # | Item | Why |
|---|---|---|
| 1 | **Approve the motion extension** (§0) | otherwise the LP violates the doctrine the repo declares |
| 2 | **`deskcomm.com.br` pointed** | I'll tell you when the LP is ready to deploy |
| 3 | **Generate the 11 images** with the prompts | you do it in ChatGPT; I deliver ready prompts, one per file |
| 4 | **Confirm the site repo** | public `deskcomm-site`, separate from the CRM (so clones don't receive the LP) |

---

*Plan written July 27, 2026.*

---

## Appendix — approved reference patterns

References sent by Rafael on 07/27: **Google CodeWiki** and **Twenty CRM**. We take the *mechanism*; the palette stays ours.

### From CodeWiki — the solid that opens into its own faces

A wireframe cube that, on scroll, unfolds into its component faces, each carrying an icon. The best motion reference for **§5 (agent's turn)**: a closed block becoming its layers.

**Adopted:** the closed → open mechanic, triggered once, with pieces staying aligned on the same axis.
**Rejected:** black background and radial blue *glow*. They violate anti-pattern #3 (`purple/blue/pink gradient`) and #4 (`cool-gray bg`). Our highlight equivalent is **absence of shadow**, not emitted light — consistent with matte clay.

### From Twenty — numbered rail + sticky visual

Large title on the left, short paragraph below, a **numbered vertical rail** (`01`, `02`, `03`) in the left margin marking the current step, and the visual on the right evolving with scroll.

**Adopted fully in §4.** The numbered rail solves a real scrollytelling problem: the visitor always knows which step they're on and how many remain. Without it, long sticky becomes disorientation.

**Rail spec:** 1px vertical line in `border`, active segment in `accent`, number in IBM Plex Mono. Current step number in `text`, the rest in `text-muted`. 200ms transition on `color` and `background` only.

### From Twenty — the substrate texture

An isometric landscape of thousands of micro-rectangles, very low contrast, reading as "the mass of data underneath". Adds density without competing with content.

**Adopted** as the background of technical sections (§5 and §7), `#e7e3da` on `#faf9f6`, opacity ≤ 8% and `pointer-events: none`. See `textura-01-substrato` in the prompts.

**Caution:** this texture is pure decoration — it explains nothing. So it is **static**. Animating it would be exactly the decorative parallax §0 keeps forbidden.
