#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Helpers
function firstLines(s, n = 5) {
  return (s || "").trim().split("\n").slice(0, n).join("\n").trim();
}

function errorSnippet(r) {
  return firstLines(r.stderr) || firstLines(r.stdout);
}

function runCommand(cmd, args, { cwd, timeoutMs, env } = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd,
      env: env ?? process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "", stderr = "", timedOut = false, settled = false;
    const timer = timeoutMs
      ? setTimeout(() => { timedOut = true; try { child.kill("SIGKILL"); } catch {} }, timeoutMs)
      : null;
    const done = (r) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve(r);
    };
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });
    child.on("error", (err) =>
      done({ code: -1, stdout, stderr: stderr || String(err?.message ?? err), timedOut, spawnError: true }));
    child.on("close", (code) => done({ code, stdout, stderr, timedOut, spawnError: false }));
  });
}

function detectCLI() {
  return "agy";
}

// Config/Prefs helpers
const PREFS_PATH = path.join(os.homedir(), ".fusion_panel_prefs.txt");

function loadPrefs() {
  if (!fs.existsSync(PREFS_PATH)) return [];
  try {
    return fs.readFileSync(PREFS_PATH, "utf8")
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#"));
  } catch {
    return [];
  }
}

async function cmdSetup(opts) {
  const cli = detectCLI();
  const report = {
    cli,
    prefsExists: fs.existsSync(PREFS_PATH),
    prefs: loadPrefs(),
    availableModels: []
  };

  if (cli === "agy") {
    const r = await runCommand("agy", ["models"], { timeoutMs: 10000 });
    if (r.code === 0) {
      report.availableModels = r.stdout.split("\n")
        .map(l => l.replace(/^[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]\s*/, "").trim()) // clean spinners
        .filter(l => l && !l.includes("Fetching") && !l.includes("models"));
    }
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    return;
  }

  console.log("Fusion Engine Setup");
  console.log("===================");
  console.log(`Detected CLI: ${cli}`);
  console.log(`Preferences configured: ${report.prefsExists ? "Yes" : "No"}`);
  if (report.prefs.length) {
    console.log(`Current panel models:\n${report.prefs.map(m => `  - ${m}`).join("\n")}`);
  }
  if (report.availableModels.length) {
    console.log(`Available models in your CLI:\n${report.availableModels.map(m => `  - ${m}`).join("\n")}`);
  }
}

async function cmdFuse(opts) {
  const cli = detectCLI();
  const prefs = loadPrefs();
  if (!prefs.length) {
    process.stderr.write("error: No models configured in panel. Run setup or config first.\n");
    process.exit(1);
  }

  let prompt = opts.prompt || "";
  if (opts["prompt-file"]) {
    try {
      prompt = fs.readFileSync(opts["prompt-file"], "utf8").trim();
    } catch (err) {
      process.stderr.write(`error: Cannot read prompt file: ${err.message}\n`);
      process.exit(1);
    }
  }

  if (!prompt) {
    process.stderr.write("error: Prompt is required.\n");
    process.exit(1);
  }

  const cwd = opts.cwd ? path.resolve(opts.cwd) : process.cwd();
  const timeoutMs = (Number(opts.timeout) || 300) * 1000; // default 5 min

  // Spawn subprocesses in parallel
  const results = await Promise.all(prefs.map(async (model) => {
    // Inject system instructions to keep it read-only
    const decoratedPrompt = `[SYSTEM INSTRUCTION: You are ${model}, a read-only advisor in a multi-model panel. Do NOT edit any files, write to the workspace, or run commands. Simply provide your best answer/analysis for the task below.]\n\nTask:\n${prompt}`;
    
    const args = ["--model", model, "--print", decoratedPrompt];

    const r = await runCommand(cli, args, { cwd, timeoutMs });
    return {
      model,
      ok: r.code === 0 && !r.timedOut,
      text: r.code === 0 ? r.stdout.trim() : "",
      error: r.timedOut ? "Timeout" : (r.code !== 0 ? errorSnippet(r) : null)
    };
  }));

  if (opts.json) {
    process.stdout.write(JSON.stringify(results, null, 2) + "\n");
  } else {
    const ok = results.filter(r => r.ok).length;
    console.log(`FUSION PANEL — ${ok}/${results.length} model(s) responded`);
    console.log("=".repeat(64));
    for (const r of results) {
      console.log(`\n----- ${r.model} · [${r.ok ? "ok" : "error"}] -----`);
      console.log(r.ok ? r.text : `(no answer) ${r.error}`);
    }
    console.log("\n" + "=".repeat(64));
  }
}

// Args parsing
const args = process.argv.slice(2);
const sub = args[0];
const opts = { _: [] };

for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith("--")) {
    const key = arg.slice(2);
    if (["prompt", "prompt-file", "cwd", "timeout"].includes(key)) {
      opts[key] = args[++i];
    } else {
      opts[key] = true;
    }
  } else {
    opts._.push(arg);
  }
}

if (sub === "setup") {
  cmdSetup(opts).catch(e => {
    console.error(e);
    process.exit(1);
  });
} else if (sub === "fuse") {
  cmdFuse(opts).catch(e => {
    console.error(e);
    process.exit(1);
  });
} else {
  console.log("Usage: node fusion.mjs <setup|fuse> [options]");
  process.exit(2);
}
