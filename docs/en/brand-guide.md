English condensed translation of docs/brand/README.md.

# Brand

## Symbol and logotype

| File | What it is |
|---|---|
| `deskcomm-icon.svg` | The symbol: an open D with a highlighted square module. 216 square. |
| `deskcomm-logo.svg` | Logotype for light backgrounds: symbol in sage `#506d48`, name in `#1c1a16`, "CRM" in `#5d594f`. |
| `deskcomm-logo-dark.svg` | Logotype for dark backgrounds: sage `#82a077`, name in `#f5f4ef`, "CRM" in `#8e8b7f`. |

The logotype text is already converted to paths: no file depends on a font.

**These SVGs are the source; the app does NOT read them.** The geometry is copied into `lib/branding/desenho.ts` and drawn inline by `components/branding/MarcaDoProduto.tsx` (sidebar, sign-in facade) and by `app/icon.tsx` (tab icon), and only shows when nobody configured a custom brand (`marcaEhADoProduto`, in `lib/branding.ts`). An `.svg` in `public/` would be served on every reseller's installation, which is the leak `tests/unit/branding.test.ts` exists to prevent. When revising the artwork, update the three files here **and** `desenho.ts`; `tests/unit/marca-do-produto.test.tsx` enforces that the colors on both sides match.

The READMEs (pt, en, es) use the files directly, in a `<picture>` that switches to the dark version per GitHub theme. The landing page (`deskcomm-site`) has its own copy in `components/Marca.tsx` and `app/icon.svg`.

Visual proof (2026-09-08, fresh local Supabase from `baseline.sql`, brand unconfigured):

| Image | What it shows |
|---|---|
| `evidence/marca/crm-login-claro.png` | Sign-in facade with the logotype, light theme |
| `evidence/marca/crm-login-escuro.png` | The same facade in dark: light sage and cream name |
| `evidence/marca/crm-sidebar-aberta.png` | Open sidebar with the logotype |
| `evidence/marca/crm-sidebar-aberta-escura.png` | Open sidebar in dark |
| `evidence/marca/crm-sidebar-recolhida.png` | Collapsed sidebar (64px) with only the symbol |
| `evidence/marca/crm-sidebar-recolhida-escura.png` | Collapsed sidebar in dark |
| `evidence/marca/favicon-produto.png` | `/icon` generated at runtime with the symbol |
| `evidence/marca/crm-login-revendedor.png` | Negative control: with `platform_branding.app_name` set, the facade has no drawing |
| `evidence/marca/favicon-revendedor.png` | Negative control: the favicon reverts to the initial on the accent color |
| `evidence/marca/lp-cabecalho.png` | Landing page (`deskcomm-site`) header with the logotype |
| `evidence/marca/lp-rodape.png` | Landing page footer with the symbol |

## Social preview (Open Graph)

`og-social-preview.png` is 1280×640, the image shown when a repository link is shared on X, LinkedIn, WhatsApp, Slack or Discord.

**How to apply:** GitHub → Settings → General → *Social preview* → Upload. There is no public API endpoint for this; it is a UI upload.

**How to regenerate** (after changing positioning, chips or palette):

```bash
# edite docs/brand/og-card.html, depois:
node -e '
import("@playwright/test").then(async ({ chromium }) => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 2 });
  await p.goto("file://" + process.cwd() + "/docs/brand/og-card.html", { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: "docs/brand/og-social-preview.png" });
  await b.close();
});'
```

The source is versioned on purpose: a card whose origin is lost becomes artwork nobody can update when positioning changes, so it either ages while lying or is redone from scratch with another identity.

## Artwork rules

- Palette read from `app/globals.css` (cream `#faf9f6`, sage `#506d48`, text `#1c1a16`). The card uses the product's real identity, not one made for it.
- Typography: Atkinson Hyperlegible (headings) + IBM Plex Mono (labels), the same as the app.
- The right panel is the living-system doctrine turned into an image: the trail a demand leaves crossing the system, ending in the follow-up, the anti-death mechanism. It is the product's argument shown, not adjectived.
- A share card **always** carries the logotype (inline in the HTML, read from `deskcomm-logo.svg`). Without it, whoever sees the image does not know whose it is.
