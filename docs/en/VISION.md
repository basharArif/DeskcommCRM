English condensed translation of VISION.md.

# Vision — DeskcommCRM

> **The open-source sales operating system with AI agents, native to WhatsApp.**
> This document is the source of truth for the project's positioning. Everything public (README, site, docs, descriptions) derives from it.

## The name

**Deskcomm** = **Desk** + **comm** (commerce): the sales desk. The whole commercial operation of a business (support, qualification, pipeline, after-sales) run from one desk, by people and AI agents working together.

"CRM" in the name is the entry category, not the ceiling. DeskcommCRM is more than a CRM: it is the system where the sale happens.

## Where we came from, where we are going

The project started in 2026 as an operational CRM for **Brazilian e-commerce**: WhatsApp via WAHA, Nuvemshop integration, native LGPD. Once the code was opened, most adopters began running Deskcomm in **clinics, info-products, real estate, agencies and service providers** — any business that sells by conversation.

Feature requests from that community pushed the product toward its current identity: **increasingly capable AI agents, integrated via MCP, actually operating the CRM**. E-commerce remains a first-class use case (Nuvemshop proves it) but it is **one** vertical, not **the** product.

**The transition in one sentence:** from "e-commerce CRM with AI" to **"sales operating system with AI agents, for any business that sells over WhatsApp"**.

## What we believe about AI agents

1. **An agent that operates, not a chatbot that decorates.** The agent reads real context (history, profile, order), queries the tenant's knowledge base (RAG per organization), replies, qualifies and moves the lead through the pipeline. It is a first-class **assignee**, under the same governance rules as a human agent.
2. **Self-improving agents.** The system is a flywheel: resolved conversations become new knowledge in the RAG base; handoffs to humans mark where the agent still falls short; per-tenant metrics and budget close the loop. Every day of operation improves the agent, with a **human gate** on decisions that matter. This is the central bet of the roadmap.
3. **MCP as the nervous system.** The whole CRM is exposed as MCP tools: first to internal agents, then as a public contract. A business should be able to plug in any agent (Claude, or whatever comes next) and have it **operate** Deskcomm: create leads, answer customers, schedule, look up orders. The CRM becomes infrastructure for agents.
4. **Human in command.** Audited handoff, role-scoped access (RBAC), queue with position, AI budget per organization. Agent autonomy grows as governance proves the agent is right.

## Product pillars

| Pillar | In practice |
|---|---|
| **Native AI agents** | RAG per tenant, sentiment analysis, audited AI-to-human handoff, AI as assignee, budget per org |
| **AI-automated CRM** | The agent moves leads, applies tags, fires WHEN/IF/THEN automations; the pipeline moves by itself |
| **Sales support tools** | Real-time Inbox, kanban with fractional indexing, customer 360, per-agent metrics, automatic routing |
| **WhatsApp-native** | Multi-number WAHA, anti-ban, media, STOP detection |
| **Multi-niche by design** | Per-pipeline configurable `vocabulary` (lead = Customer/Patient/Buyer; won = Paid/Scheduled/Closed); the same core serves e-commerce, clinics, real estate, info-products |
| **Truly self-hosted** | Your data on your VPS, one-command install kit, self-healing `baseline.sql`, one-script updates |
| **Native compliance** | Multi-tenant with RLS tested in CI, LGPD by design (redact, data_request, anonymization), append-only audit |

## Positioning

**Entry category (anchor):** the **open-source, self-hosted** alternative to closed WhatsApp support and sales platforms (Kommo, Octadesk, Intercom, Zendesk).

**Own category (flag):** **sales operating system with AI agents** (*AI Sales OS*). Incumbents sell a chat subscription with a bolted-on bot; we deliver a system where the AI agent is a native operator and the code is yours.

**One-liner (pt-BR):**
> DeskcommCRM é o sistema operacional de vendas open source com agentes de IA nativos e WhatsApp — self-hosted, multi-tenant, para qualquer negócio que vende conversando.

**One-liner (en):**
> Open-source AI sales OS: a self-hosted CRM where AI agents natively operate sales and support over WhatsApp — an open alternative to Kommo, Octadesk and Intercom.

**Audience:** Brazilian (and other) businesses that sell over WhatsApp (e-commerce, clinics, real estate, info-product creators, agencies, services) and the dev/self-hosting community that installs it for themselves or clients.

## Project model

- **The software is 100% open source (MIT), complete, with no paid version.** No subscription. No locked features.
- **Monetization is infrastructure:** the project is developed in partnership with **HostGator**. The recommended production path is their VPS (São Paulo datacenter), installed by `hostgator-setup-kit` in one command. Subscribing through the partner link supports the project and is cheaper for the subscriber.
- **The generic path is never sabotaged:** `docker compose` and the self-host kit work on any VPS. The partnership is the recommended path, never the only one.

## Communication principles

1. **Keywords first, jargon later.** Every public title leads with "open source", "AI agents", "WhatsApp", "CRM", "self-hosted" before any internal subsystem name.
2. **Show, don't describe.** A product screenshot/GIF above the fold on every page.
3. **Explicit anchor.** "Open-source alternative to X" appears in the GitHub About, README and site, so demand for the incumbents (search and LLMs) finds us.
4. **E-commerce is an example, not the definition.** Cite use cases as a multi-niche list.
5. **Model transparency.** The HostGator partnership and telemetry are stated in plain language in the README, never hidden.

## Three-year north star

Be the default answer, from Google, ChatGPT, Reddit and Brazilian devs, to **"what is the best open-source CRM with AI agents and WhatsApp?"**: thousands of self-hosted instances, an ecosystem of agents plugged in via public MCP, and a self-improvement flywheel that makes every instance sell better each month.

*Last reviewed: 2026-07-19 (repositioning from e-commerce to multi-niche / AI Sales OS).*
