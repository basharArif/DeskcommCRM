English condensed translation of docs/presentation/pitch-deck.md.

---
marp: true
theme: default
class: invert
paginate: true
title: DeskcommCRM — Pitch Deck v0.1
description: Operational CRM with AI for Brazilian e-commerce
date: 2026-04-29
---

> **Snapshot of 2026-04-29.** This deck was built when the deploy target was Vercel, hence the architecture and cost slides. The CRM is now self-hosted on a VPS; the deploy that counts is in [`docs/runbooks/deploy.md`](../runbooks/deploy.md).

# DeskcommCRM

### The operational CRM where **AI and humans serve** e-commerce SMB customers together on WhatsApp.

**Multi-tenant · LGPD-native · MCP-ready · Brazil-first**

<sub>Rafael Melgaço — São Paulo, April 29, 2026</sub>

---

## 1. The problem

Brazilian e-commerce SMBs handle customers in chaos:

- **Personal WhatsApp Web + spreadsheet + the agent's memory.** When the agent leaves, the relationship leaves too.
- **100% human support is expensive.** 5 agents for 12h/day doesn't add up.
- **B2B CRMs (Pipedrive, RD, Zendesk) don't fit.** A SaaS pipeline is not an e-commerce cycle.
- **LGPD compliance is fragile.** Fines rising since 2023; merchants are the first target.
- **No CRM exposes native MCP.** Power users who want an AI agent to orchestrate have no option.

> **Result**: SMBs either overpay for poor support, or lose sales and burn reputation.

---

## 2. Our vision

DeskcommCRM is the platform where:

| Support | Technology | Compliance |
|---|---|---|
| **AI covers 60-70%** of repetitive cases | Per-tenant RAG (FAQ + policy + catalog + history) | Native LGPD: Nuvemshop redact/data_request webhooks are first-class contracts |
| Humans handle **only what matters** | Sentiment detection escalates automatically | Intact audit trail, 5-year retention |
| **Multi-channel ready** (WhatsApp v1; Instagram/email v4) | SaaS-ready multi-tenant from day 1 | TOTP MFA enforced for admins |

**In 3 years**: dominate e-commerce support BPO in Brazil → open a direct SaaS for merchants → expand to VTEX/Shopify → public MCP for power users.

---

## 3. Who uses it

### Today — BPO mode
**Your company** runs the CRM internally, serving multiple client e-commerce stores through a *unified inbox* (a super-admin role that crosses tenants).

### Tomorrow — SaaS mode
Same product sold directly to merchants to run themselves. **Zero refactor** — Postgres RLS multi-tenancy from day 1.

### Target customer (tenant)
Brazilian e-commerce SMB on **Nuvemshop**:
- ~5,000 orders/month
- ~300 conversations/day
- 2-5 human agents
- 1-2 WhatsApp numbers

---

## 4. Competitive edge

### 4 pillars no incumbent offers together

🤖 **AI running support, not a decorative chatbot**
- Per-tenant RAG (FAQ + policy + Nuvemshop catalog + resolved conversations)
- Real-time sentiment detection (Haiku 4.5)
- Main reply by Sonnet 4.6 via Vercel AI Gateway

🛒 **E-commerce-native, not generic B2B**
- Default pipeline already mapped: Abandoned cart → Paid → Shipped → Delivered → After-sales
- Vocabulary customizable per niche (Customer/Order/Paid vs Lead/Deal/Won)

🔌 **MCP-ready** (Phase 2)
- 19 canonical tools for LLMs to orchestrate the CRM
- `crm://schema` resource to ground external AI

🛡️ **LGPD-native**
- Nuvemshop webhooks `customer/redact`, `customer/data_request`, `store/redact`
- SLA: data_request D+7, redact D+15
- CPF encrypted at rest with pgcrypto

---

## 5. Architecture (high level)

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 14 App Router)        Vercel             │
│  - 3-column Inbox (Conversations + Chat + CRM SidePanel)    │
│  - Kanban with drag-drop fractional indexing                │
│  - Realtime via Supabase Realtime                           │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│  Backend (Next.js Route Handlers + Workers)                 │
│  - REST API /api/v1 (cursor pagination, idempotency-key)    │
│  - Webhooks: WAHA + Nuvemshop                               │
│  - Workers: AI bot · Sentiment · LGPD · Sync · Anti-ban     │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│  Postgres (Supabase, sa-east-1) — 15 tables with RLS        │
│  - organizations · contacts · crm_leads · crm_lead_links    │
│  - messages · ai_chunks (pgvector) · event_log · audit_log  │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────┐    ┌──────────────────┐    ┌──────────┐
│  WAHA Plus (NoWeb)  │    │ Vercel AI Gateway│    │ Upstash  │
│  Hostgator VPS BR   │    │ Anthropic +      │    │ Redis    │
│                     │    │ OpenAI fallback  │    │ (rate)   │
└─────────────────────┘    └──────────────────┘    └──────────┘
```

**Architectural doctrine**: triggers NEVER do HTTP · `event_log` + workers · idempotency via `unique(org, external_id)` · RLS on every tenant-aware table · adapter pattern for platforms.

---

## 6. What's already done (04/28/2026)

### Documentation

- ✅ **Master PRD + 6 Sub-PRDs** (~25k words) — vision, scope, ACs, risks
- ✅ **60 Business Rules** cataloged (T/L/W/P/AT/IA/B) with enforcement layer + override matrix
- ✅ **8 Technical Specs** (~60k words) — SQL schema, TS code, detailed flows
- ✅ **15 Mermaid diagrams** (C4 L1/L2/L3, ER, sequence, state machines)

### Deployed infrastructure

- ✅ **Active Supabase project in sa-east-1** (`rrydmwnporysaiysiztn`)
- ✅ **15 tables with RLS** enabled (organizations, contacts, crm_leads, event_log, audit_log, idempotency_keys, etc.)
- ✅ **3 migrations applied** (platform_base, event_log, customer_360)
- ✅ **Domain triggers** (auto won/lost, denormalized activity, emit events, seed pipeline)
- ✅ **Canonical RLS helpers** (`fn_user_org_ids`, `fn_is_platform_admin`, `fn_role_at_least`)

### Codebase

- ✅ Next.js 14+ App Router scaffold (config, env, supabase clients, API wrappers)
- ✅ docker-compose for local WAHA
- ✅ CLAUDE.md with conventions for future devs
- 🔄 Inbox + Kanban + AI workers (next)

---

## 7. Roadmap

| Phase | Duration | Deliverable |
|---|---|---|
| **MVP-B** | 8-12 wks | Platform + Customer 360 + WAHA + Pipeline + Support + RAG chatbot + Sentiment handoff + Nuvemshop |
| **1.5 Hardening** | +4-8 wks | Dense E2E tests, runbooks, deep observability, security review |
| **2 Public MCP** | +6-8 wks | `/crm-mcp` MCP server with 19 tools, HTTP deploy, Bearer auth |
| **3 Probabilistic identity** | +4 wks | Device fingerprint, behavior matching, merge UI |
| **4 Multi-channel** | +6-8 wks | Instagram DM, email, web chat |
| **5 Multi-platform** | +4 wks each | VTEX, then Shopify |

---

## 8. Success metrics (MVP)

| KPI | Target | How we measure |
|---|---|---|
| AI resolution rate | 50–60% | Conversations without `handoff_triggered` ÷ total resolved |
| Avg first response time | <30s AI, <5min human | Diff `messages.created_at` inbound → next outbound |
| Post-support NPS | ≥75 | Automatic survey after `conversation.status='resolved'` |
| Avg cost per conversation | <R$ 3.00 | Total monthly cost ÷ resolved conversations |
| WAHA ban rate | 0% (alarm at ≥1) | Health check + Sentry |
| LGPD data_request SLA | ≤7 business days | Diff `webhook.received_at` → `export.delivered_at` |
| Tenant uptime | ≥99.5% | External health check |

**MVP validated when**: 1 real tenant in production for 30 continuous days with no incident + 5/7 KPIs measured automatically + LGPD passes manual review.

---

## 9. Operating cost (MVP, 1-3 tenants)

| Component | Monthly |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 + add-ons |
| Hostgator VPS (WAHA, Turing plan, SP) | ~R$140 (~$28) |
| Upstash Redis | $5–15 |
| WAHA Plus | $30 |
| Sentry Team | $26 |
| AI (Anthropic via Gateway) | $50–300 / tenant (variable) |
| **Fixed total** | **~$140/month** |
| **Total with AI** | **~$170–420/month per tenant** |

**Margin**: at R$ 1,500/month per tenant (target price) → gross margin >70% in SaaS mode.

---

## 10. Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **WAHA ban** (WhatsApp detects unofficial API) | 🔴 Critical | Inherited anti-ban (throttle, warm-up, spinning, STOP). Pre-warmed backup number. Documented runbook. |
| **Nuvemshop contract change** | 🟠 High | Adapter pattern isolates; contract tests in CI. |
| **WAHA Plus banned upstream** | 🟠 High | Documented BYO mode; future migration to official Meta API planned. |
| **AI cost scales worse than revenue** | 🟠 High | Per-tenant budget + 80% alarm / 100% throttle; Haiku fallback. |
| **LGPD fine hits first tenant** | 🔴 Critical | LGPD from day 1; legal review pre-production; D+7 SLA with alarm at D+5. |
| **Cross-tenant leak** | 🔴 Critical | RLS on every table; mandatory isolation tests in CI. |
| **Small team burnout** | 🟡 Medium | Sub-PRDs prioritized Now/Next/Later; MVP-A (no AI) as fallback. |

---

## 11. Why now

**A unique competitive window, 3 converging factors:**

1. **WhatsApp Business in Brazil** is already the #1 channel (RD Station: 65% of Brazilian companies use WhatsApp). No native Brazilian CRM combines the channel with AI.
2. **Anthropic's MCP gained traction in 2025.** The window is open to be the **first MCP-ready Brazilian CRM**.
3. **LGPD is entering active enforcement.** SMBs are exposed; **compliance becomes a sales differentiator**, not a cost.

> Whoever arrives first with the right stack **sets the standard for the niche**.

---

## 12. Why it will work

### Solid architectural doctrine

We fully adopted the **inherited bundle** from the reference *Aula CRM Nichado WAHA* — a conceptually tested schema, cataloged edge cases (ban, LGPD, multi-device), 9 named anti-patterns (including the lethal "trigger does HTTP").

### Disciplined engineering

- **60 business rules** with a documented enforcement layer
- **RLS multi-tenancy** from day 1 (not a retrofit)
- **Idempotency by default** on every webhook
- **Dense, append-only audit trail**, 5 years

### Realistic time-to-market

8-12 weeks to MVP-B in production. No blind faith, no baseless optimism — **an estimate calibrated on the implementation order inherited from the reference**.

---

## 13. What we need for the next step

### Capital

- ~R$ 80-150k to cover the first development quarter (2-3 full-stack devs + 1 part-time DevOps + infra)
- ~R$ 30k/month for initial BPO operation (1-2 senior agents while AI scales)

### Market validation

- 1-2 pilot Nuvemshop e-commerce stores (5k+ orders/month) for MVP validation
- Letter of intent / pre-contract to anchor the commercial roadmap

### Team

- 1 lead engineer (me)
- 2 mid/senior full-stack
- 1 part-time DevOps
- Ad-hoc LGPD legal counsel

---

## 14. Demo / next actions

### Today

- 🎯 Presentation of the technical-commercial plan (this deck)
- 🎯 Public / private GitHub repo with all documentation + scaffolding
- 🎯 Supabase + Vercel already provisioned (sa-east-1)

### Next 2 weeks

1. Implement Inbox + Kanban (Sub-PRD 04 → Spec 04 already done)
2. Connect the 1st WhatsApp number via local WAHA
3. Implement webhook receiver with HMAC + idempotency
4. RAG bot stub with 1 source (FAQ markdown)

### Next quarter

- MVP-B in production
- 1st pilot tenant operating
- Iteration based on real metrics

---

## 15. Thank you

> "**It's not another CRM. It's the platform where AI and humans serve customers together.**"

📧 rafael@maudibrasil.com.br
📍 São Paulo, BR
🔗 docs: github.com/melgarafael/DeskcommCRM (coming soon)

**Questions?**
