English condensed translation of docs/growth/lp-prompts-imagens.md.

# LP 3D image prompts

> To generate in ChatGPT. **Generate everything in one session** — it keeps the pieces coherent.
> Order matters: generate `mesa-01` first and use it as the visual reference for the rest.

---

## How to use

> Names in the tables below are **how to save each file**; the image extension is left out on purpose, even here.
> None of these images exist in the repository yet — this document is the spec for generating them. Written with the extension, they would be read as delivered proof by the guard `tests/unit/evidencia-citada.test.ts`, which requires that a cited image be a versioned image.

1. Open **one** new ChatGPT conversation and paste the **Style Block** below as the first message, alone.
2. Then paste one prompt at a time, in this document's order.
3. Always ask for **PNG with transparent background**. If it comes with a background, ask *"same image, transparent background"* — don't regenerate from scratch, or the scene changes.
4. From the second image on, start with: *"Same style, same camera angle, same lighting and same palette as the previous image."*
5. Name files exactly as each block's ID.

**Rule that saves rework:** no image has text. Labels, numbers and names go in as HTML on top. Text inside PNGs isn't read by search engines or AI crawlers, can't be translated and looks jagged on retina screens.

---

## STYLE BLOCK (paste first, alone)

```
You are generating a series of 3D illustrations for a product website. All images
must look like they came from the same render, same scene, same session.

Fixed style for every image in this series:

- Isometric 3D render, camera at 30 degrees, orthographic projection.
- Matte clay material: soft, very slightly rough surface. NO gloss, NO chrome,
  NO glass, NO metal, NO neon, NO glow, NO gradients.
- Strict palette, no other colors allowed:
    background / base          #faf9f6  (warm off-white)
    raised surfaces            #ffffff
    structure and edges        #e7e3da  (warm greige)
    active elements            #506d48  (desaturated sage green)
    warning elements only      #b8863b  (muted amber)
    deep accent, sparingly     #2f3c2b
- Soft studio lighting from the upper left. Long, soft shadows in warm grey
  rgba(20,18,14,0.10). No hard shadows, no rim light.
- Generous empty space around the subject. Calm, precise, architectural.
- NO text, NO labels, NO numbers, NO letters, NO UI chrome, NO icons.
- Transparent background, PNG with alpha.
- Reference feeling: an architectural maquette or a museum model — not a
  videogame asset, not a tech illustration, not isometric clipart.

Confirm you understood and wait for the first image request.
```

---

# GROUP 1 — HERO

## `mesa-01-completa` — the reference scene

> Generate this **first**. All others inherit its camera and light.

```
An isometric 3D scene: one large rounded-rectangle desk surface floating in
empty space, seen from above at 30 degrees. The desk is warm off-white with a
subtle 1-unit raised edge.

Carved into the desk surface are thin recessed channels — grooves, not lines —
whose inner floor is sage green. The channels connect five modules that sit on
the desk:

1. LEFT EDGE: a module of three stacked rounded plates, slightly offset, like
   a small pile of cards (a conversation).
2. UPPER MIDDLE: four short vertical columns made of small stacked tiles,
   different heights (a pipeline).
3. CENTER: the tallest module, a rounded cylinder-ish block in sage green,
   slightly raised above the others (the agent).
4. RIGHT: a low circular module with a thin concentric ring on top (a timer).
5. BOTTOM: a wide flat module made of many thin parallel horizontal bars
   (a log).

Every module touches at least two channels. Nothing floats detached.
A single small sage sphere rests at the mouth of the conversation module,
at the left edge of the desk.

Composition: the desk occupies the right two-thirds of the frame, with empty
space on the left. Slight overhang beyond the frame on the right side.
```

### Hero layers

After the full scene, request each layer **isolated**, always with this formula:

```
Same scene, same camera, same lighting, same scale. Render ONLY [ELEMENT].
Everything else fully transparent. Do not move or resize anything.
```

| File | `[ELEMENT]` |
|---|---|
| `mesa-01-a-tampo` | `the desk surface and its shadow, with the empty channels carved but unlit` |
| `mesa-01-b-trilhas` | `the sage green channel floors, glowing softly from within the grooves` |
| `mesa-01-c-pecas` | `the five modules sitting on the desk` |
| `mesa-01-d-lead` | `the single small sage sphere` |

---

# GROUP 2 — THE TWO VILLAINS

## `viloes-01-planilha-bonita`

```
Same style, same camera, same lighting and same palette as the previous image.

An isometric 3D scene: a desk surface like before, but BROKEN — the modules sit
scattered and disconnected, and the channels between them are carved but dead
ends: each groove stops short and never reaches the next module. Between two of
the modules there is a visible gap in the desk itself, a rectangular hole cut
through the surface.

A small sage sphere is caught mid-fall through that hole, halfway below the
desk plane. Nothing is reaching for it.

Mood: quiet, orderly, and wrong. The scene should look tidy — that is the point.
```

## `viloes-02-robo-que-some`

```
Same style, same camera, same lighting and same palette as the previous image.

An isometric 3D scene: a single sage green rounded module sits alone on a small
desk fragment. From its front face, three thin sage arcs project outward and
forward, like emitted sound. Behind and beside the module, all channels are
empty grooves that lead nowhere — no receiving module, no log, no record.

The desk fragment ends abruptly a short distance behind the module, like a
broken-off piece of a larger surface.

Mood: something is speaking with confidence into a place where nothing is
listening or recording.
```

---

# GROUP 3 — SCROLLYTELLING (the centerpiece)

> Seven states of the **same** scene, in close-up. Generate `cena-00-base` and derive from it.
> Coherence is critical here: if the camera changes between states, the scroll transition breaks.

## `cena-00-base` — the tight framing

```
Same style, same camera, same lighting and same palette as the previous image.

Close-up isometric view of the CENTER of the desk from the first image: the
conversation module (left), the sage agent module (center, tallest), the pipeline
columns (upper right), the timer ring (right) and the log bars (bottom).
The channels connecting them are clearly visible and currently unlit (plain
greige grooves).

Fill the frame with this cluster. This is the base state — everything present,
nothing active.
```

### The seven states

For each, start with: *"Same close-up scene, same camera, same lighting. Change ONLY what I describe; everything else stays identical."*

| File | Requested change |
|---|---|
| `cena-01-chega` | `The conversation module is now lit sage. A thin flat panel rises just above and behind it, like a card being lifted from the desk, showing blank rounded rows.` |
| `cena-02-contexto` | `Add a small cluster of thin stacked plates to the left of the agent module, connected to it by a lit sage channel. Three of the plates are slightly pulled out from the stack.` |
| `cena-03-gates` | `Add a row of seven small identical upright blocks forming a short corridor between the agent module and the desk edge. Six blocks are sage green. The fourth one is amber and slightly rotated, blocking the corridor.` |
| `cena-04-veto` | `Zoom slightly toward the amber block. A thin flat panel rises beside it with blank rounded rows, and a short sage channel curves from the amber block BACK toward the agent module, forming a return loop.` |
| `cena-05-move` | `The small sage sphere now sits at the top of the second pipeline column instead of at the conversation module. The channel it travelled along is lit sage behind it.` |
| `cena-06-handoff` | `Add a second module beside the agent, same size but warm off-white instead of sage. A small flat plate is suspended midway between the two, tilted, as if being handed across.` |
| `cena-07-followup` | `The circular timer module is now lit sage with its ring partially filled. The sage sphere sitting in the pipeline column now has a thin amber ring around its base.` |

---

# GROUP 4 — THE AGENT'S TURN (exploded view)

## `turno-01-fechado` and `turno-01-aberto`

> Motion reference: Google CodeWiki's cube that opens into its own faces.
> **Deliberate difference:** no dark background or blue glow. Here the piece opens into horizontal layers, and the "glow" is absence of shadow, not emitted light.

```
Same style, same camera, same lighting and same palette as the previous image.

IMAGE A — closed:
A single solid rounded block, like a thick slab, floating in empty space at the
same isometric angle. Warm off-white, with six barely visible horizontal seams
across its side faces, suggesting it is made of six stacked layers pressed
together. One thin sage line runs vertically down its front face.

IMAGE B — exploded:
The exact same block, now separated into its six layers, spread apart vertically
with equal gaps between them, still perfectly aligned on the same vertical axis.
Each layer is a thin rounded slab. Between consecutive layers, a short vertical
sage connector links them.

The FIFTH layer from the top is amber instead of off-white, and from its left
edge a sage connector curves UPWARD and back into the FOURTH layer, forming a
visible return loop that bypasses the layers below it.

Keep the two images at identical scale and position so they can be cross-faded.
```

---

# GROUP 5 — RADAR

## `radar-01`

```
Same style, same camera, same lighting and same palette as the previous image.

An isometric 3D scene: a circular disc set into the desk surface, with three
concentric raised rings dividing it into three bands.

- The innermost band is amber and holds four small spheres clustered close together.
- The middle band is warm greige and holds six spheres, more spread out.
- The outer band is sage green and holds eleven spheres, evenly distributed.

Each sphere casts its own small soft shadow onto the disc. The rings are low —
this is a shallow relief, not a bowl.
```

---

# GROUP 6 — MULTI-NICHE

## `nichos-01-funil`

```
Same style, same camera, same lighting and same palette as the previous image.

An isometric 3D scene: four vertical columns of stacked rounded tiles, side by
side, of decreasing height from left to right (7, 5, 3, 2 tiles). Each column
sits on a small rounded base plate. Thin sage channels connect the base of each
column to the next.

Above each column, leave clearly empty space — no labels, no text, nothing.
That space is reserved for HTML labels.
```

> One image only. The four niche variants are HTML label swaps, not four renders.

---

# GROUP 7 — WHITE-LABEL

## `marca-01`

```
Same style, same camera, same lighting and same palette as the previous image.

An isometric 3D scene: two identical rounded rectangular slabs, side by side and
slightly overlapping in depth, like two screens seen from above at an angle.
Both have the same internal structure of blank rows and blocks.

The LEFT slab has a small sage green square badge in its upper-left corner.
The RIGHT slab has a small amber circle badge in the same position.

Everything else about the two slabs is pixel-identical. The point is that only
the mark differs.
```

---

# GROUP 8 — BACKGROUND TEXTURE (optional, inspired by Twenty)

## `textura-01-substrato`

> A finding from the Twenty references: the isometric landscape of micro-rectangles that reads as "the data substrate". Used at low opacity behind the technical sections.

```
Same style, same lighting and same palette as the previous image.

A large flat isometric field made of thousands of tiny rectangular blocks of
varying lengths and very low height, arranged in dense horizontal rows, like a
schematic landscape seen from above at 30 degrees. Warm greige on off-white,
extremely low contrast.

Some regions are denser, some sparser, creating a subtle organic texture.
A few small clusters are sage green. No focal point — this is a field, not a
subject. It should read as quiet background texture, never as an illustration.

Square format, tileable if possible.
```

---

## Checklist before finalizing each image

- [ ] No text, number or letter inside the image
- [ ] Only palette colors — no blue, purple, pure red or black
- [ ] No gloss, glass, chrome or neon
- [ ] Transparent background
- [ ] Same camera angle as the previous ones
- [ ] Warm shadow (not blue-grey, not black)

## If an image comes out off-standard

Don't fix it with a brand-new prompt — that changes the whole scene. Ask for the specific correction: *"Same image, but [only the fix]. Do not change anything else."* If it still diverges, regenerate from `mesa-01-completa` attached as reference.

---

*Written July 27, 2026. Paired with `lp-plano.md`.*
