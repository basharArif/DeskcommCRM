# WAHA e marca própria (white-label)

> Movido verbatim de `CLAUDE.md` (HQ-213, 2026-11-07), onde estas seções ficavam sob "Convenções críticas (NÃO NEGOCIÁVEIS)"; só os links relativos foram ajustados ao novo local. Porta e regras duras: [`CLAUDE.md`](../../CLAUDE.md).

### WAHA
- Imagem NOWEB pinada por arquitetura: `latest-2026.7.2` em x86 e `noweb-arm-2026.7.2` em ARM64. A prova local criou duas sessões CORE simultâneas até `SCAN_QR_CODE`; não prova pairing, duas contas `WORKING` nem envio. Não bloquear segunda sessão por tier: conferir resposta estruturada e pós-condição da operação.
- Engine NOWEB default; WEBJS apenas se precisar stickers animados / botões
- Auth: env do WAHA recebe **hash SHA512 hex** da api key; cliente envia plaintext em `X-Api-Key`
- Webhooks: HMAC SHA512 com `crypto.timingSafeEqual`
- Anti-banimento: throttle 1 msg/1.2s + jitter ≤800ms. Campanha 1 msg/5s. Warm-up 7-14d. Spinning de copy. Janela de disparo 7h-22h (domingo LIBERADO por default desde 2026-08-20; a janela é knob por canal). Janela de RESPOSTA por canal (0495, `channel_knobs.resposta_*`), que herda a de disparo quando vazia — só `inbound_turn`/`case_reply_turn` a leem
- STOP detection: a regra mora em `lib/opt-out/deteccao.ts` e é a MESMA nos dois lados —
  a ingestão (que grava `is_blocked=true`) e o runtime do agente. **Não é mais a palavra
  solta:** só bloqueia palavra ISOLADA (mensagem inteira = a palavra) ou verbo de cessação
  com OBJETO DE COMUNICAÇÃO ("parar de me mandar", "sair da lista"). Enquanto eram duas
  regras, a ingestão bloqueava paciente que perguntou "tem como parar a dor?" — medido em
  clínica, 12 falsos positivos num corpus de 32 frases de nicho.
  Cobre português e espanhol, nos dois níveis (inequívoco e ambíguo) — foi preciso um PR
  além do #275 (que só tinha coberto o vocabulário inequívoco) para o espanhol ganhar a
  camada ambígua e as construções com pronome preso ("escribirme"). Para ver o vocabulário
  em vigor sem confiar nesta linha:
  `sed -n '/PALAVRAS_DE_OPT_OUT/,/^]/p' lib/opt-out/deteccao.ts | grep -E '^ *"'`, e as frases de controle em
  `tests/unit/opt-out-deteccao.test.ts`.
  O Jev (`lib/ai/decisao/pedidos.ts`) só é perguntado onde esta regra disse não, e nunca bloqueia
  ninguém — no máximo abre um aviso na Central ("Avisar a equipe"): a regra continua a única que bloqueia
  (cerca: `tests/unit/jev-nunca-cala-bloqueia-nem-responde.test.ts`).
- Mídia: subir pro Supabase Storage primeiro, passar URL ao WAHA (não inline base64)
- Multi-device: assinar `message.any` (não só `message`); tratar `fromMe=true` sem duplicar
- Grupos: entram **só os ligados** em Conexões › Grupos (`channel_session_groups`). O grupo ligado vira conversa `is_group` com um contato `kind = 'whatsapp_group'` que nunca entra em funil, lista, campanha ou IA; o remetente é `p.author` (nunca `p.from`), gravado em `messages.metadata.group_sender` (`lib/messaging/remetente-de-grupo.ts`). Para conversa de grupo o banco emite `message.group_received`, e não `message.received`, e o roteamento automático pula grupo. O filtro `ignore.groups` do WAHA é propriedade desta funcionalidade (`definirRecebimentoDeGrupos`); compatibilidade e convergência não o tocam. Spec: `docs/superpowers/specs/2026-09-23-grupos-na-inbox-design.md`
- Cron `recover-stuck-messages` (`app/api/v1/cron/recover-stuck-messages/route.ts`, agendado no `scheduler` do `docker-compose.prod.yml`): marca `status='sending'` há >5min como `failed` **e abre aviso na Central** (`agent_inbox_items` kind `message_send_stuck`). Não toca em `queued`: esse estado tem dono (o agent-engine reagenda por `SEND_QUEUED_RETRY_MS`), e falhá-lo perderia mensagem que ia sair. Não reenvia — envio em dobro é pior que não-envio

### Marca própria (white-label)
- **Uma imagem Docker serve todas as marcas.** Nada de `NEXT_PUBLIC_*` para marca, nada de `public/favicon.ico`, nada de imagem por revendedor — a imagem é pré-buildada e o `update.sh` regrava `APP_IMAGE` incondicionalmente
- **O banco está ACIMA do `.env`.** `platform_branding` (instalação) e `organizations.settings.branding` (organização) são a fonte; `APP_NAME`/`APP_LOGO_URL`/`APP_ACCENT_HEX` são **semente e piso de rollback** (o `agent.sh` reverte a imagem, nunca o banco)
- **Resolvedor NUNCA lança.** `lib/branding/instalacao.ts` e `lib/branding/saida.ts` degradam para o padrão do produto e seguem: `branding()` roda em `app/layout.tsx`, e um throw ali é 500 em todas as telas
- **Saída sem DOM usa `marcaDaSaida()`** (`lib/branding/saida.ts`) — e-mail, remetente, ícone, `issuer` do MFA. Um hex e uma frente legível, tema **claro** sempre. Nunca passe `MarcaResolvida` a template de e-mail
- **O PDF de LGPD NUNCA leva marca.** Ele nomeia o **controlador** (`organizations.legal_name`) e o DPO resolvido. Nomear ali o revendedor — que é operador — inverteria papéis num documento que responde a direito legal. Vigiado em `tests/unit/mapas-de-arquitetura.test.ts`
- Vazamento de marca no código é vigiado por `tests/unit/branding.test.ts` (varre `app|components|lib|workers|hooks`), com allowlist que **só encolhe**. Contexto de venda em [`docs/white-label.md`](../white-label.md); mapa em `docs/architecture/marca-propria.architecture.json`
