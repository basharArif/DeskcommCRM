English condensed translation of docs/features/trackeamento-de-campanha.md.

# Tracking campaign, ad set, ad and placement

Traffic operators ask "where did this lead come from?" at four levels: campaign, ad set, ad and placement. The contact record answers at all four when the source makes it through to the CRM.

This document describes the whole design: the three traffic sources that reach WhatsApp, what each needs, and how to configure it.

## The three sources and what each needs

| Source | How the origin arrives | What the operator does |
|-------|---------------------|----------------------|
| **WhatsApp conversion campaign** | native `referral` in the webhook (`ctwa_clid`, `source_id`) | nothing, it is automatic |
| **Form on the page** | direct POST to the webhook; `lib/webhooks/inbound.ts` accepts any `utm_*` key | puts the UTMs in the form fields |
| **Page with a WhatsApp button** | only the message TEXT gets through | picks one of the two transports below |

**Why the third source is different, and the reason is physical.** The `wa.me` link does not talk to the CRM: it opens the app on the person's device, and the server never sees that click. The only thing that arrives afterwards is the message text, so the origin has to travel inside it.

The two naive approaches do not work, measured rather than assumed: `wa.me?utm_campaign=x` does not arrive (only `text` travels through the operating system, with no cookie or referrer), and UTMs written as loose text are deliberately ignored: the text belongs to the customer, and accepting it would let anyone forge attribution.

## The two text transports

Both work, neither is deprecated; the difference is who builds the marker.

### `[ref:XXXXXX]` — the capture address (recommended)

The page button points to an address on the CRM itself instead of `wa.me`. The server stores the UTMs, generates a six-character code and redirects to WhatsApp with that code in the text:

```
Olá! Vim pelo site. [ref:K7M2P9]
```

Eleven characters in the message and **no script on the page**. It is the same mechanism the product already uses to capture Google Ads' `gclid`.

### `[dk1:<base64url>]` — the self-contained code

The page builds the marker with the UTMs inside it, in base64url. No server in the middle, so it remains the way out for those who cannot change the button's destination, at the cost of about 200 visible characters in the lead's message and a script on the page, because the marker must be generated **per visitor**: two visitors from different campaigns cannot get the same marker, and a static link generates nothing.

The contract is in `lib/leads/origem-do-site.ts`.

## Why the ref must go through the server

The natural question is "why not leave the code ready inside the link".

```
João  clicks (Black Friday)  → needs a code tied to Black Friday
Maria clicks (Mother's Day)  → needs ANOTHER code, tied to Mother's Day
```

A link is static text: it hands the same value to everyone. For the code to be born at click time, something has to run at that instant: either a script on the page (`[dk1:]`) or a server redirect (`[ref:]`).

What does NOT need to be born per visitor are the UTMs: they can be fixed in the pasted URL when each campaign has its own page or button.

## How to configure the capture address

1. In **Settings → Conversions**, section "Who arrived via the site", choose the WhatsApp number and the text the person will send. The text must keep the code field.
2. Copy the address the screen shows.
3. Paste it into your page's WhatsApp button, in place of the `wa.me` link.
4. In the ad, put the URL macros in the parameters: `utm_campaign`, `utm_adset`, `utm_ad` and `utm_placement`.

**If the same page serves more than one campaign**, the button must pass on the parameters the page received. A fixed `href` carries no UTM: the conversation comes in with no origin. The alternative is for the ad to point straight to the capture address, with no page in between.

## What the contact record shows

First one present wins, left to right:

| Row on screen   | Keys read, in order                         |
|-----------------|---------------------------------------------|
| Source          | `utm_source` → `ad_platform` → `source`     |
| Campaign        | `utm_campaign` → `campaign_name`            |
| Ad set          | `utm_adset` → `adset_name`                  |
| Ad              | `utm_ad` → `ad_name` → `ad_title`           |
| Placement       | `utm_placement`                             |

A row with no value does not appear: a dash on five rows in a row reads as a data-entry defect, not as "this contact did not come from an ad".

## Declared limits

- **The origin counts only on the contact's FIRST message, and does not overwrite the first touch.** Testing with a number that is already an old contact stamps nothing; it looks like a bug, it is the rule working. Whoever arrived from a paid ad first keeps the paid ad; whoever arrived from the site first keeps the site.
- **A ref is consumed only once.** The same text forwarded on does not become attribution for the recipient.
- **Placement does not exist in click-to-WhatsApp.** The platform exposes *placement* only in aggregated insights breakdown, never per individual click.
- **Capture failure never becomes an error screen.** Every bad path of the capture address returns WhatsApp, without the code if need be. An ad click is money spent: losing attribution is acceptable, losing the lead is not.
- **Customer text is untrusted input.** The list of accepted keys is closed (`CHAVES_DE_UTM`), with a per-value cap; anything that is not a campaign key does not get through, by construction.

## Where this lives in the code

| Piece | File |
|------|---------|
| `[dk1:]` contract and key list | `lib/leads/origem-do-site.ts` |
| Short-code mechanism (generator, pattern) | `lib/plataformas-de-anuncio/captura-de-clique.ts` |
| ref↔UTM pair (consumption) | `lib/plataformas-de-anuncio/meta/captura-de-clique.ts` |
| token↔gclid pair (Google Ads) | `lib/plataformas-de-anuncio/google/captura-de-clique.ts` |
| UTM capture address | `app/api/v1/anuncios/meta/[org]/route.ts` |
| gclid capture address | `app/api/v1/anuncios/google/[org]/route.ts` |
| Consumption at ingestion | `lib/channels/pos-entrada.ts` (`guardarOrigemDaPagina`) |
| Screen | `app/app/settings/conversoes/` |
