English condensed translation of docs/features/mensagens-rapidas.md.

# Quick messages

The **Messages** button at the bottom right follows authenticated navigation. Open the list, search for a contact and select a conversation to read and reply without leaving the screen. The expand icon opens the same conversation in the full Inbox; the pencil goes to Contacts to start a conversation through the existing flow.

Minimizing keeps the conversation, attachments and text being edited. Going back to the list keeps one text draft per conversation during this navigation. Reloading the page or switching organization clears these local drafts. Nothing else is persisted in the browser. The counter shows unread conversations across the whole access scope, including beyond the first page of results.

## Limits and recovery

- APIs, RLS, sending, attachments, notes and history are the same as the Inbox.
- Read-only support, blocked/anonymized contact and closed conversation still prevent sending. A closed window directs the user to open the full Inbox.
- A minimized conversation is not marked as read. The two visible conversations (Inbox and panel) are acknowledged by the notification control.
- Read failures show **Try again**; send failures use the existing Composer handling and text restoration.
- An active call moves the button up to preserve the call controls.

## Living System Checklist

1. Entry: `useConversationsRealtime`, `useConversationCounts` and `useConversation`.
2. Exit: `ChatThread`, `Composer` and the `/app/inbox/[id]` link.
3. Record: send/note go through `useSendMessage`/`useCreateNote` and existing APIs.
4. Visibility: history shared between panel and Inbox.
5. Door: `AppShell` mounts `FloatingInbox` on every authenticated screen.
6. Anti-death: global counter, realtime updates and explicit retry; opening the panel creates no new campaign or automatic reply.
7. Configuration: existing permissions and channels; no new credential or env.
8. Continuity: same AI/human conversation and history; full ownership and return-to-AI controls remain available via the expand button.
9. Feedback loop: send errors reach the Composer; the operator fixes/resends or expands to resolve blocks. Opening/minimizing makes no automatic decisions.
10. Map: `docs/architecture/mensagens-rapidas.architecture.json`.
