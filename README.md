# PartnerPortal

## Local development — Supabase MCP secrets

The Supabase MCP server (used by Claude Code for DB access) authenticates with an
account-wide Supabase Personal Access Token. That token is **not** committed to this
repo — it lives in an [Infisical](https://infisical.com) vault, and the committed
`.mcp.json` pulls it in at launch via `infisical run`. Each developer authenticates
with **their own** Infisical account; nothing secret is distributed or stored on disk.

One-time setup per developer:

1. **Install the Infisical CLI** — `winget install infisical.infisical` (Windows),
   `brew install infisical/get-cli/infisical` (macOS), or see the
   [install docs](https://infisical.com/docs/cli/overview). Open a new terminal after
   installing so it's on your `PATH`.
2. **Get access** — ask an admin to invite you to the **PartnerPortal** Infisical
   project (you sign up with your own identity at https://app.infisical.com).
3. **Log in** — `infisical login` (interactive; the session persists in your OS
   keychain, so you won't log in again each launch).
4. **Done** — `.mcp.json` and `.infisical.json` are already in the repo, so Claude
   Code's Supabase MCP server will resolve the token automatically. Restart your
   editor after first login so the MCP picks up your session and `PATH`.

If `infisical login`'s session expires you'll occasionally be prompted to run it
again — that's the only recurring step.
