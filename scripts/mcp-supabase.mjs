#!/usr/bin/env node
// MCP launcher for the Supabase server.
//
// Loads SUPABASE_ACCESS_TOKEN (and any other vars) from the gitignored
// .dev.vars at the repo root, then execs the official Supabase MCP server over
// stdio. This replaces the previous `infisical run` wrapper in .mcp.json so the
// server uses the locally-cached token (see architecture.md → "Local-token MCP
// credentials"). stdout is kept clean for the JSON-RPC stream (child inherits
// stdio); all diagnostics go to stderr.
//
// Run `node scripts/mcp-supabase.mjs --check` to verify the token loads without
// starting the server.
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PROJECT_REF = "fwiudagfnntuwqhglkdi";
const here = dirname(fileURLToPath(import.meta.url));
const envPath = join(here, "..", ".dev.vars");

function loadDotEnv(path) {
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch (e) {
    console.error(`[mcp-supabase] cannot read ${path}: ${e.code || e.message}`);
    return {};
  }
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const eq = s.indexOf("=");
    if (eq === -1) continue;
    const key = s.slice(0, eq).trim();
    let val = s.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const vars = loadDotEnv(envPath);
// .dev.vars wins over any stale ambient value (the whole point of the cache).
const env = { ...process.env, ...vars };

if (!env.SUPABASE_ACCESS_TOKEN) {
  console.error(
    "[mcp-supabase] SUPABASE_ACCESS_TOKEN not found in .dev.vars or environment"
  );
}

if (process.argv[2] === "--check") {
  const t = env.SUPABASE_ACCESS_TOKEN || "";
  console.error(
    `[mcp-supabase] check: .dev.vars=${Object.keys(vars).length} keys; ` +
      `SUPABASE_ACCESS_TOKEN ${t ? `present (len ${t.length})` : "MISSING"}; ` +
      `project-ref ${PROJECT_REF}`
  );
  process.exit(t ? 0 : 1);
}

// shell:true is required on Windows so `npx` resolves to npx.cmd — Node refuses
// to spawn .cmd files directly (EINVAL) since the 18.20/20.12 security change.
// Pass the full command as one trusted string (PROJECT_REF is a static constant)
// to avoid the DEP0190 warning that shell:true + an args array triggers.
const cmd = `npx -y @supabase/mcp-server-supabase@latest --project-ref=${PROJECT_REF}`;
const child = spawn(cmd, { stdio: "inherit", env, shell: true });
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
child.on("error", (e) => {
  console.error(`[mcp-supabase] failed to spawn npx: ${e.message}`);
  process.exit(1);
});
