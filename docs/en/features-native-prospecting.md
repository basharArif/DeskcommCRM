English condensed translation of docs/features/prospeccao-nativa.md.

# Native prospecting

Under **CRM → Prospecting**, an admin configures the Apify key, searches companies in Brazil by segment/region and views business data. The adapter uses the same Google Maps Actor as the existing flows. It does not depend on n8n or write to Airtable.

Search is paid from the Apify account balance: up to 100 companies, with a cap of US$ 0.50 to US$ 10 per run. The count may be lower. Enrichment looks up business e-mails and social links from the website, never individuals or decision makers. The key is encrypted by `fn_encrypt_oauth` and unavailable to browser roles. No mandatory key in `.env`.

## Campaign

After the search, set the agent, connection, pipeline, entry stage, qualified stage, offer, criteria, pace and the real reference of the legitimate-interest assessment. The agent must be published, automatic, have the `crm_move_lead_stage` tool and access to the pipeline. It must serve the selected channel or be a router member with continuity active. The router may forward a change of subject to another agent.

### Create an agent without leaving the campaign

**Configure by conversation** is the main way to prepare the campaign. **Use existing agent** keeps manual selection and configuration. Describe the goal in your own words; the AI asks short questions about what is missing, reuses campaign data and proposes name, approach, qualification criteria, connection and stages. You can keep talking to correct the summary. No need to pick tools or write a technical prompt.

The conversation uses the AI already configured in the CRM, through the same credentials, budget and cost-recording mechanism. It only proposes: it gets no write tools, creates no agents and sends no messages to contacts. Connection, pipeline and stage IDs are checked against the organization's real resources.

The summary follows the conversation from the start, showing what is defined and what is missing. Suggestions allow one-click answers. Progress is saved on the campaign, separate from the configuration that starts the queue; two tabs cannot silently overwrite each other. A save failure shows on screen.

**Test as customer** prepares a paused draft and uses the same sandbox as the agent editor. The test does not publish, change routing or send messages to contacts. Write tools are proposed, not executed. If the configuration changes, the previous test no longer represents the new draft.

The review card shows approach, criteria, channel and pipeline. **Publish and use agent** is the confirmation that publishes the agent, prepares the commercial and human-handoff capabilities and selects it in the form, with access to the chosen pipeline. It can receive conversations on the channel; the campaign keeps waiting for the separate **Start AI outreach** command. **Advanced settings** opens the existing editor.

When the channel uses a router, the agent is added without replacing the others. Enabling same-agent continuity, except on change of subject or handoff, requires an explicit choice on the review card; the AI cannot authorize this change. Without a router, a channel served by another agent requires reusing the current agent or configuring routing, avoiding replacing existing service without notice. Failures keep the conversation and campaign data. Repeating the same confirmation recovers the previous creation without producing another agent. Configuration history resumes on page reload; it is not a customer conversation in the Inbox. Cancelling a response stops the wait and propagates cancellation to the AI call. This does not guarantee a refund of tokens the provider already processed.

### Voice assistant

The agent editor offers **Voice assistant**, configured through ElevenLabs Agents. The integration is optional and uses the organization's ElevenLabs account. The key is encrypted on the server; the browser receives only a temporary authorization for the test. Voice, language, first message and instructions can be reviewed.

The test uses the browser's microphone and audio. It does not start calls to customers nor automatically connect the assistant to WhatsApp calls. Voice configuration and text-agent publishing are independent actions. Later changes to the text prompt must also be reviewed and saved in the voice configuration.

Activation creates contacts and deals using the existing handlers. Phones and company identifiers are unique per organization; earlier contacts are preserved. An interrupted preparation must be resumed with the same configuration. The queue starts after one minute and sends only the first approach. Replies go through normal conversation handling; qualification requires the operator-defined criteria and counts only when the deal's stage changes. Finding a company does not mean qualifying it.

There is one active campaign per organization, up to 50 attempts in 24 hours across all campaigns, and a minimum interval of five minutes. Failures and uncertain sends consume the limit. Number window, test mode, agent version, conversation closure, opt-out, pause and human intervention remain active. Pausing stops new approaches; a transmission already started may finish.

## Operation and recovery

- The scheduler calls `/api/v1/cron/prospecting` every minute with an internal secret. Update the scheduler image together with the app. In development, `pnpm dev:crons` includes the same route.
- A search without confirmation is never retried automatically: check the Apify runs before starting another.
- An uncertain send is not resent automatically. The result and Inbox link stay on the campaign for review.
- A send error pauses the campaign. Resume after fixing the agent, connection or conversation; failed candidates stay under review.
- New extractions are started manually. There is no automatic list reload or follow-up sequence for non-responders.

## Living system

Entry: admin and search → `prospecting_campaigns/candidates`. Exit: `createContactHandler`, `createLeadHandler`, `sendMessageHandler` and the agent turn in the Inbox. Commands emit `prospecting.changed`; registration and conversation keep the canonical activities. Results, errors and next sends appear in `/app/prospecting`, registered in the navigation catalog. Failure pauses the queue and requires review, and the conversation outcome changes the displayed state. Human/AI continuity uses the existing Inbox. No reply does not start new automatic follow-ups; the operator reviews the history to decide the next step.

Map: `docs/architecture/prospeccao-nativa.architecture.json`.

### Continuity checklist: configuration and voice

- **Entry and exit:** the admin talks in `ProspectingAgentBuilder`; the session belongs to the campaign and prepares a canonical version in `ai_agents/ai_agent_versions`. `VoiceAssistantPanel` uses that agent to configure a private agent at ElevenLabs.
- **Record and surface:** configuration routes use the canonical audit; voice operations record `ai_agent.updated` or `ai_agent.tested`, without credentials. Summary, save, test result and failures appear in their respective panels.
- **Access and configuration:** Prospecting menu → Configure by conversation; Agents menu → editor → Voice assistant. The draft also offers a direct link to that tab. Missing key and failure to list voices have their own messages and actions.
- **Recovery:** session revision prevents overwrites between tabs; retries keep the same identifier and distinguish prepare from publish. An uncertain remote creation is reconciled via the persisted marker before accepting a new one.
- **Human continuity:** the paused test transfers no contacts. Publishing prepares the text agent's canonical handoff. In this increment voice is a browser test session, with no tools, transfer or customer calls; it opens no Inbox demand and promises no commercial actions.
- **Feedback and map:** a conflict requires reloading state; a provider error allows fixing and repeating the same attempt. A private-configuration mismatch blocks the voice test until re-sync. Entries and exits are in the map above.

### Anonymization and re-extraction

Canonical contact anonymization also clears the candidate's phone, address, e-mails, links and enrichment and removes it from the queue. Pseudonymous tokens, server-only and never returned by the API, prevent re-importing the same source or phone in the organization. Deleting data at the search provider follows that provider's own process.

The contact data export includes the source, collected data and outreach state of the candidates linked to it, with the same scope as anonymization. It does not include suppression tokens or internal send authorizations.
