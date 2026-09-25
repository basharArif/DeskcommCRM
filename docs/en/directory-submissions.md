English condensed translation of docs/growth/submissoes-diretorios.md.

# Directory submissions

Open source software directories are the most underrated **GEO** lever in the plan: research measured that **85.7% of the citations an LLM makes about a brand point to domains the brand does not control**, and these directories are among the most cited when someone asks "what is the best open source alternative to X". Do not expect direct traffic: no public study quantifies visits from awesome-lists. The return is being citable by third parties.

---

## 1. awesome-selfhosted (blocked until 2026-11-27)

**308.6k stars.** The heaviest directory in the category.

**Do not submit yet.** The PR template literally requires: *"Any software project you are adding was first released more than 4 months ago."*

The repository was created on **2026-04-28**. v1.0.0 shipped on **2026-07-27**.

**The date is 2026-11-27, not 2026-08-28.** The rule says *released*, not *created*, and the release is what the reviewer can check without leaving the page: the Releases tab shows a single entry, which in August would still read "1 month ago". A rejection there is not private: it stays in the PR thread, indexed, on a 308k-star domain, read by exactly the audience we want. Waiting four months costs less. There is no honest way to speed it up: the "first release" is a fixed date in the past, and cutting new releases does not move it.

**The slot is worth the wait.** The `Customer Relationship Management (CRM)` tag currently has **two** projects, `django-crm` and `espocrm`, and **none** with WhatsApp (checked 2026-07-28).

**How it works:** the submission does **not** go in the README. It is a YAML file in [`awesome-selfhosted-data`](https://github.com/awesome-selfhosted/awesome-selfhosted-data), at `software/deskcommcrm.yml`, one item per PR, kebab-case file name.

**Ready entry:** `docs/growth/awesome-selfhosted-deskcommcrm.yml`. Copy the content below the comments. Tag and platform names were checked on 2026-07-28 against the `name:` field of each file in their repository, **not** against the file name (`customer-relationship-management-crm.yml` declares `Customer Relationship Management (CRM)`). Referencing by file name is the most common rejection.

Two fields the file does **not** carry: `stargazers_count` and `commit_history` are injected by their bot after merge.

> `depends_3rdparty: true` is correct and deliberate: the agent depends on an external LLM provider. Declaring it is a directory requirement and matches the project's stance; omitting it would be the kind of half-truth the repo doctrine does not allow.

**Their PR checklist** (all must be true on the day): one item per PR; actively maintained project; working install instructions; no duplicate in open or closed issues/PRs; optional fields and comments removed.

---

## 2. opensourcealternative.to (cost decision)

**Web form.** Fields: e-mail, alternative's site, name, repository, proprietary software's site, proprietary software's name.

Criteria: open source; alternative to a proprietary software; actively maintained; self-hosted. **We meet all four.**

**The decision is cost:**

| | |
|---|---|
| **US$ 29** | 48-hour review |
| **Free** | 6+ month queue |

**Recommendation: pay.** A six-month queue is too long for a campaign, and this is one of the domains on the first page for "best open source CRM", so it is LLM citation material, which is exactly what we are buying. US$ 29 is the cheapest item in the whole plan.

**How to fill it in:** submit once per competitor, starting with the highest search volume:

| Proprietary software | Site |
|---|---|
| Kommo | kommo.com |
| Intercom | intercom.com |
| Octadesk | octadesk.com |

Alternative name: `DeskcommCRM` · Repository: `https://github.com/melgarafael/DeskcommCRM`

---

## 3. AlternativeTo (can go now)

Requires an account. No cost, no age gate.

- **Name:** DeskcommCRM
- **Category:** CRM / Customer Support
- **License:** Open Source (MIT)
- **Platforms:** Self-Hosted, Web, Docker
- **Alternative to:** Kommo, Intercom, Octadesk, HubSpot, Zendesk
- **Description:** *Open-source AI sales OS for WhatsApp. AI agents answer, qualify and move deals inside a CRM you host yourself. Multi-tenant with row-level security, LGPD by design, MIT-licensed with no paid tier.*

---

## 4. LibHunt (can go now)

Indexes automatically from GitHub and accepts submissions. No cost.

**Submission path:** there is no prominent standalone "add project". The documented path is to open a similar listed project, click **Suggest alternative** and send our repository URL. There is also a form at `libhunt.com/site/project_submit`.

**Calibrated expectation:** their ranking is driven by mentions and repository activity, not by listing. Being there alone moves little. It is a cheap item, not a lever.

LibHunt's category sites (including `selfhosted.libhunt.com`) mirror *awesome* lists. **Unconfirmed** whether the self-hosted one is generated from `awesome-selfhosted`: the site returns 403 to automation and the probe did not conclude. If it is, we get in for free with the November PR and submitting now is redundant. Check manually before spending the effort.

The repository topics are already saturated (20 of 20 used), which is the source they read.

---

## 5. Evaluated and discarded

Recorded so nobody revisits:

| Directory | Why |
|---|---|
| [`btw-so/open-source-alternatives`](https://github.com/btw-so/open-source-alternatives) | **Abandoned.** 8.6k stars attract, but the last merge was in **November 2024** and **37 PRs** have sat unanswered since. The CRM section has a single entry. A PR there is work nobody reads. |
| `awesome-crm` | **Does not exist** with relevant weight. The largest with that name has 6 stars. |

---

## What NOT to do

- **Do not pay for stars or incentivize stars with gifts.** It violates GitHub's Acceptable Use Policy, and the numbers are harsh: **90.42% of repositories with fake-star campaigns were deleted** by GitHub, against a 5.03% baseline. The positive effect lasts under two months and then becomes a liability.
- **Do not do coordinated seeding on Reddit.** AI moderation detects the pattern, the FTC treats undisclosed endorsement as a deceptive practice, and, worst, threads denouncing astroturfing rank for the brand search and **persist in AI answers**. The backlash becomes a permanent citation too.
- **Do not chase GitHub Trending as a goal.** The criteria were never published. The "30 to 40 stars in 1-2 hours" threshold the industry repeats comes from **a 2017 blog post about a single repository**.

---

*Last updated: 2026-07-28. awesome-selfhosted dates checked against the template and releases; `btw-so/open-source-alternatives` measured and discarded.*
