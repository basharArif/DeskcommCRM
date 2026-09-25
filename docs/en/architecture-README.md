English condensed translation of docs/architecture/README.md.

# Architecture maps

## The one rule of this directory: JSON is the SOURCE; HTML is DERIVED

Each map has a `*.json` (source) and may have a `*.html` (render).

> **If the two diverge, the HTML is wrong.** Never hand-edit the HTML: regenerate it from the JSON.

The easiest format to edit is the one that ages while lying: a fix made in HTML seems to work, vanishes on the next generation, and in the meantime the source silently stopped being the source.

## Maps

| file | scope |
|---|---|
| `prospeccao-nativa.architecture.json` | commercial search, gradual queue, persistent conversational configuration, sandbox and optional voice assistant |
| `pre-go-live-whatsapp.architecture.json` | per-channel test mode (issue #573): admin configuration, shared gate, re-read at send time and validation through the Inbox |
| `app-da-meta-da-instalacao.architecture.json` | installation-level Meta App (issue #850, migration 0257), 10 parts, 12 edges; the `/admin/meta` screen that stores the key and shows the token once, the resolver that serves the whole pair from ONE source (database, with `.env` as fallback), and why Connections only shows the token when it came from `.env` |
| `agenda-google-sync.architecture.json` | sources/destination per owner, stable tuple, three paths, claim/CAS and calendar coverage; presence and LGPD integrated |
| `encerramento-atendimento.architecture.json` | independent conversation/demand, inbound mutex, immutable job origin, current memory and guards before effects |
| `agent-turn.workflow.json` | Conversation and Operator agents, deterministic Meet deliveries and approved replies; human review wired to the same core and send chain. The JSON is the current source; the HTML is an earlier render |
| `crm-vivo.architecture.json` | **CRM Vivo** subsystem, 24 parts, 44 edges, 6 lanes |
| `atualizacao-self-service.architecture.json` | update button in the UI: `agent.sh`/`update.sh` (host) <-> agent route <-> instance tables <-> footer/screen |
| `gestao-funis.architecture.json` | pipeline management from the Kanban screen, 18 parts, 30 edges; the three pipeline dependencies and why the database defends only one |
| `ia-360-organizar.architecture.json` | IA 360 W4, the agent organizes the operation: 18 parts, 24 edges; one rule per operation serving REST and MCP, configuration authoring next to state, and **four declared non-links** (authoring does not point to `ai_agents`; the agent does not write automatic rules, canned replies, or the canonical tag vocabulary) |
| `ia-360-retencao.architecture.json` | **Don't lose the customer** package (IA 360, wave 2), 26 parts, 36 edges; the single return rule for the engine and the configurable capability, and why cancelled had to stop being equal to fired |
| `escalacao-ciclo-humano.architecture.json` | the agent <-> person cycle, 30 parts, 38 edges; the **three** handoff locks (only one was loose) and how the person's decision returns to the turn context |
| `central-avisos.architecture.json` | batch projection under RLS, real context, and independent resolve/reopen (Notification Center) |
| `followup-dossie.architecture.json` | follow-up dossier and human intervention, 20 parts, 30 edges; the **two halves** of the race against the engine (the claimed tick and the in-flight turn) and four declared non-links |
| `followup-duplicar.architecture.json` | duplicate and rename a flow: copy is always a draft, org-unique name, the same name PATCH now surfaced in the list and builder |
| `followup-retorno.architecture.json` | "Customer came back" trigger: inbound after silence, inline send, agent turn yields |
| `indice-de-atrito.architecture.json` | friction index, 24 parts, 31 edges; the friction ruler, the radar that reads it and the demands that feed it |
| `marca-propria.architecture.json` | white-label, 37 parts, 54 edges, 6 lanes; the org -> installation -> `.env` -> default stack, the outputs WITHOUT a DOM (`marcaDaSaida`), and the **declared non-link** of the LGPD PDF, which prints the CONTROLLER and never the reseller's brand |
| `retencao-de-historico.architecture.json` | history pruning (issue #261), 16 parts, 18 edges, 6 lanes; what goes (old `done`/`failed`/`dead`), what has an owner and stays (`pending`/`running`, and `dead` with an open notice), and why the audit purge is a `security definer` with no row selector instead of a door |
| `extensoes-declarativas.architecture.json` | declarative profile: rehearsal catalog, admission, receipts, local archive, per-organization activation, in-CRM guide, version swaps (update and undo last swap), installation removal and organization audit; proof state lives in the map's own `contracts.status` |
| `banco-de-dados-externo.architecture.json` | external database (migration 0372, slice of PR #1130 by @vgamkt), 14 parts, 19 edges, 4 lanes; admin registration and read by all, the `_safe` view as the screen's only surface, the network guard revalidated on EVERY pool open, and the **declared non-link**: agent tools stayed in the source PR and arrive in a second slice |

> **This table has rotted before:** it listed 8 maps when disk had 9 (`indice-de-atrito` was missing). No test reads this README (the gate reads the `.json` files), so a new map without a row here is invisible to readers. Check with `ls docs/architecture/*.json` before trusting the list.

### Warning: only `agent-turn.workflow.json` is renderable today

Measured with archify 2.11.0: the `*.architecture.json` files here **do not validate in either mode**. As `workflow` they stop at `diagram_type`; as `architecture` they stop on shape (that schema wants `components`, not `lanes`/`nodes`/`edges`). Changing `diagram_type` does not help: the `node.type` values we use (`api`, `service`, `table`, `lib`, `route`, `tool`, `config`) are outside archify's enum (`frontend|backend|database|cloud|security|messagebus|external`), several `col` values exceed 5, and the `dot` values `sky`/`red`/`blue`/`green` do not exist in the card enum.

Proof nobody tried to render them: there is **one** `.html` in the directory, for the only file that validates.

This does not invalidate the other maps. They remain the JSON source of truth, read by people and by `tests/unit/mapas-de-arquitetura.test.ts`. But following "re-render" on any of them yields a schema error.

### `crm-vivo.architecture.json` is a BLUEPRINT, not a photograph

It describes the **contracted** design of the epic's eight waves. Waves 6, 7 and 8 **do not exist in code yet**; the map is not wrong, it is ahead.

Invariants the shape does not show live in the JSON's own `cards`, including **deliberate non-links** (e.g. the score stays **out** of the realtime publication on purpose). *Absence of an edge is indistinguishable from a forgotten edge, so a non-link is **declared**, not drawn.*

## The CONTACT x DEAL axis toll

Three different parts paid the same cost:

| where | what it cost |
|---|---|
| **dossier** (wave 6) | the timeline was indexed by `contact_id`; a deal without a contact was silent (25% of leads, 64% of activities) |
| **reactivation** (wave 7) | `cron_jobs` is per contact; a deal without a contact cannot receive a resume proposal (26 of 68 open) |
| **agent pipeline** (wave 8) | `lead_state.stage` is per contact while the card is per deal; a contact with two deals forces a choice of which one moves |

**The edge:** `contacts` -(1:N)- `crm_leads`. Almost every agent mechanism lives on the CONTACT side while almost every product surface lives on the DEAL side.

**The resulting rule:** any new part linking an agent mechanism to a CRM surface crosses that edge and must answer three questions **before** being written:

1. What if the contact has **two** open deals? Reuse `resolveActiveLeadForContact`; never write a second resolver.
2. What if the deal has **no** contact? That is 25% of cases, not a corner.
3. What does the part do when it cannot decide? Doing nothing and leaving a trace is an answer; acting on the wrong deal is not.

All three times the cost was the same: discovering the edge **during** implementation, with the part half built.
