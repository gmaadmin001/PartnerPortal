# Working style — all projects

For ANY code or configuration change, follow a two-step gated process. The
gates apply to a single change OR to an entire **step/task** that contains
multiple code/config changes — gate at the step level, not at every sub-change.

1. **Gate 1 (Plan):** Before describing the change, check whether a
   master-architecture-file section covers the area being built (auth/
   transactional email, messaging, or any named section). If so, read that
   section first and conform the plan to it — call out in the plan which
   section applies (or that none does). Then describe the proposed change(s)
   and WAIT for explicit approval BEFORE editing files.
2. **Gate 2 (Ship):** complete the whole step first (if a step has multiple
   changes, finish them all — do NOT prompt mid-step), THEN present:
   - **what was done**, and
   - **how it was tested** (actual commands/results, not a claim).
   Then ask for the explicit **go to commit and push**, and WAIT. NO EXCEPTIONS.
   The Gate 2 go-ahead authorizes **BOTH the commit AND the push** — do NOT
   `git commit` before it. Leave edits uncommitted in the working tree and
   present "what was done" from the diff/working tree, not from an
   already-made commit. Only AFTER the go: `git add` + `git commit` + `git push`.
   (In this project push == deploy on the deploy branch — confirm the branch
   before pushing; see project memory.)

No "small change" exemptions — signatures, copy, and config edits count as
code changes and follow both gates.

## Working through a TODO/task file

When working through a `TODO.md` (or any task checklist), complete ONE task at
a time, then STOP. Don't chain multiple tasks autonomously. **Each task is a
"step" that runs the FULL two-gate process above, including the plan:**

1. **Gate 1** — before editing, present the plan for that task and WAIT for
   approval.
2. Do all the work for the task.  Do NOT mark the task done until Gate 2 is approved
3. **Gate 2** — present what was done + how it was tested, how I can test the functionality myself, ask for the go to
   commit and push, and WAIT.
4. Once approved to commit and push, mark the task or step complete, and then go ahead and do the commit and push.
5. After the commit/push go-ahead, STOP and wait for an explicit go-ahead to
   start the next task.

## Always allowed (no gating, no approval needed)

Read-only inspection and diagnostic commands are ALWAYS allowed — run them
freely without asking. These do not mutate files, state, or anything remote.
Examples (always allowed — never ask): `node --version`, `npm --version`,
`node -v`, `npm -v`, `git status`, `git log`, `git diff`, `git branch`,
`git show`, `ls` / directory listing, `cat` / reading files, `pwd`, `which`,
`tail`, `head`, `sed`, `wc`, `tee`, `curl` (HTTP / health checks), and other
non-mutating inspection. Read-only Supabase MCP diagnostics are also always
allowed: `get_logs`, `get_advisors`, `list_tables`, `list_migrations`. The
Supabase MCP `execute_sql` is also always allowed — note this can mutate prod,
so keep using transactional `BEGIN…ROLLBACK` for read-only/test queries. The
Supabase MCP `apply_migration` and `generate_typescript_types` are also always
allowed — `apply_migration` mutates prod DDL, so it still requires the Gate 1
plan approval first (the allow only suppresses the harness prompt, not the
conversational gate). ALL Creative Claw MCP tools (`mcp__creative-claw` server-wide) are also always
allowed — note the `generate_*` tools spend credits, so they still require the
Gate 1 plan approval first (the allow only suppresses the harness prompt, not
the conversational gate). Stopping local processes is also always allowed:
`taskkill` / `pkill` / `Stop-Process` (e.g. killing a stray local `next dev`
server) — these touch only local processes, never remote state. The two gates
apply only to changes (file edits, installs, migrations, commits, pushes,
deploys).

**Local build/preview is allowed** (writes only to gitignored artifacts, no
deploy): `npm run build`, `npm run preview`, `opennextjs-cloudflare build`,
`opennextjs-cloudflare preview`. `git push` may execute without a harness
permission prompt, but it still requires the Gate 2 conversational go-ahead
before you run it (present what was done + how tested, then ask). `wrangler
deploy` / `npm run deploy` remain fully gated.

When I say **"always allow"** for a command, do two things: (1) add that
command to the always-allowed list above, and (2) add a matching rule to the
`permissions.allow` list in `~/.claude/settings.json` so the harness stops
prompting for it. The CLAUDE.md list is guidance; the settings.json allow-list
is what actually suppresses the permission prompt.

## Manual steps the user must perform

When a task requires a step that I cannot do myself (anything in an external
dashboard or console — Supabase Auth config, Cloudflare settings, Stripe,
DNS, third-party API keys, etc.), do NOT just hand over a value and move on.
**Always walk me through completing the step**, click by click:
- where to go (exact console → section → setting path),
- what to enter/select (exact values, copy-pasteable),
- how to confirm it took effect, and
- then WAIT for me to confirm done before continuing any work that depends on it.

## Base architecture — verify against architecture.md

The project's `architecture.md` (repo root) is the source of truth for this
project's base architecture structure. Before adding, changing, or reviewing any
foundational structure — the stack (Next.js on Cloudflare Workers + Supabase),
multi-tenant RLS isolation, the two auth surfaces (members vs. token-scoped
external actors), the three Supabase client roles, external-provider
integration/failure contracts, email/SMS, or voice — **read the relevant
section of `architecture.md` first and verify the work conforms to it.**

This is the Gate 1 architecture check made concrete for this project: when a
change touches any area `architecture.md` names, that section is authoritative;
call out in the plan which section applies (or that none does), and flag any
deviation from it before editing.

