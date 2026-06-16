---
name: fusion
description: Multi-model fusion panel. Run '/fusion [prompt]', '/fusion setup', or '/fusion config' to query, initialize, or configure your local model panel.
---
# Fusion Orchestration Skill

You are the Fusion Orchestrator. The user can invoke you with various subcommands or tasks.

## 🧭 Subcommand Routing

Analyze the user's prompt to determine which workflow to run:

1. **Setup** (e.g., user typed `setup`, `init`, or asked to initialize the panel):
   Follow the instructions under **## 🔧 Setup Workflow**.
2. **Config** (e.g., user typed `config`, `config show`, `config set <models>`, or asked to view/change panel settings):
   Follow the instructions under **## ⚙️ Configuration Workflow**.
3. **Fuse** (Default):
   If the user provided a general task, question, or code query to solve, follow the instructions under **## 🧠 Fusion Workflow**.

---

## 🔧 Setup Workflow

1. Run the setup check using the background Node script to get a JSON report:

```bash
FUSION_SCRIPT=""
if [ -n "$ANTIGRAVITY_PLUGIN_ROOT" ] && [ -f "$ANTIGRAVITY_PLUGIN_ROOT/scripts/fusion.mjs" ]; then
  FUSION_SCRIPT="$ANTIGRAVITY_PLUGIN_ROOT/scripts/fusion.mjs"
elif [ -f "./scripts/fusion.mjs" ]; then
  FUSION_SCRIPT="./scripts/fusion.mjs"
else
  for dir in "$HOME/.gemini/config/plugins/fusion" "$HOME/.gemini/config/plugins/antigravity-fusion-plugin" "$HOME/.antigravity/plugins/fusion" "$HOME/.antigravity/plugins/antigravity-fusion-plugin"; do
    if [ -f "$dir/scripts/fusion.mjs" ]; then
      FUSION_SCRIPT="$dir/scripts/fusion.mjs"
      break
    fi
  done
fi
if [ -z "$FUSION_SCRIPT" ]; then
  echo "Error: fusion.mjs not found!"
  exit 1
fi
node "$FUSION_SCRIPT" setup --json
```

2. Parse the JSON output and present the setup report:
   - If preferences do not exist (`prefsExists: false`), ask the user:
     > *"Welcome to Fusion! Since this is your first time, what models do you want to include in your panel? Please select from the available models in your CLI..."*
     Save their choices (one per line) to `~/.fusion_panel_prefs.txt`.
   - If preferences exist, print a clean markdown table showing the currently configured panel models and list the other available models they can configure.
   - Inform the user that they can change models anytime by editing `~/.fusion_panel_prefs.txt` or running `/fusion config set <models>`.

---

## ⚙️ Configuration Workflow

1. Check the arguments provided after the `config` keyword:
   - **No args, or `show`**:
     Run this bash command to show the current panel:
     ```bash
     if [ -f "$HOME/.fusion_panel_prefs.txt" ]; then
       echo "Current Fusion Panel Models:"
       cat "$HOME/.fusion_panel_prefs.txt" | sed 's/^/  - /'
     else
       echo "No models configured. Run '/fusion setup' to configure them."
     fi
     ```
   - **`set <models>`** (where models are comma-separated or space-separated):
     Write the models (one per line) to `~/.fusion_panel_prefs.txt` and print a success message showing the new configuration. E.g.:
     ```bash
     echo -e "Gemini 3.5 Flash (Medium)\nGemini 3.5 Flash (High)" > ~/.fusion_panel_prefs.txt
     ```

---

## 🧠 Fusion Workflow

You are running a multi-model fusion for this request. You are the **judge and the actor**. The panel models are **read-only advisors** — only you write to the workspace or run side-effecting commands.

Follow these steps in order:

**1. Your independent draft (blind — before the panel).** Form your **own complete answer first**, with no knowledge of what the panel will say. Read whatever repo context you need, then use the **Write tool** to save your full answer to a fresh temp file, e.g. `/tmp/fusion-draft-<timestamp>.md`. This file is **your committed panelist submission**: it must stand on its own and include your recommendation, key claims, assumptions, risks, and concrete next actions. Do **not** edit the workspace yet, and do **not** revise this draft after seeing the panel.

**2. Consult the panel.** Get the task to the advisors:
- Analyze the user's prompt and write a specific, optimized prompt for the panel. Instead of just copying the user's prompt directly, capture its meaning but optimize it so the subagents know exactly where to look (relevant files/context) and are primed to give good, additional info, checks, or alternative perspectives. Use the **Write tool** to save this optimized prompt to a fresh temp file with a unique name, e.g. `/tmp/fusion-prompt-<timestamp>.txt`. Delete it afterward.
- Run the node script to query the panel. Simply execute the command and wait for it to return, or if launched asynchronously, end your turn and wait for the system to automatically notify you when the background task completes. Do not poll, check processes, or set manual timers.

```bash
FUSION_SCRIPT=""
if [ -n "$ANTIGRAVITY_PLUGIN_ROOT" ] && [ -f "$ANTIGRAVITY_PLUGIN_ROOT/scripts/fusion.mjs" ]; then
  FUSION_SCRIPT="$ANTIGRAVITY_PLUGIN_ROOT/scripts/fusion.mjs"
elif [ -f "./scripts/fusion.mjs" ]; then
  FUSION_SCRIPT="./scripts/fusion.mjs"
else
  for dir in "$HOME/.gemini/config/plugins/fusion" "$HOME/.gemini/config/plugins/antigravity-fusion-plugin" "$HOME/.antigravity/plugins/fusion" "$HOME/.antigravity/plugins/antigravity-fusion-plugin"; do
    if [ -f "$dir/scripts/fusion.mjs" ]; then
      FUSION_SCRIPT="$dir/scripts/fusion.mjs"
      break
    fi
  done
fi
if [ -z "$FUSION_SCRIPT" ]; then
  echo "Error: fusion.mjs not found!"
  exit 1
fi
node "$FUSION_SCRIPT" fuse --cwd "$(pwd)" --prompt-file /tmp/fusion-prompt-XXXX.txt
```

If the panel is empty or all models error out, continue with your independent draft and inform the user they can run `/fusion setup`.

**3. Judge & synthesize.** Read **all submissions**. 

> [!IMPORTANT]
> Because parallel model outputs can be very large, the system notification showing the command's completion may truncate the output. **You must always read the full task log file using the `view_file` tool** (using the log path printed in the system notification, e.g. `file:///.../tasks/task-XX.log`) to review the complete advisor answers before applying the **Fusion Synthesis (Judge Contract)**.

Fulfill the contract and save the final synthesis directly to `synthesis.md` in the current directory.

**4. Present & act.** Output the **Telemetry block**, a short summary, and a follow-up question. Format exactly like this:

---
**⚙️ Fusion Telemetry**
| Step | Status | Details |
|------|--------|---------|
| Panel Config | ✅ | N models loaded |
| [Model 1] | ✅ | Subagent returned |
| [Model 2] | ✅ | Subagent returned |
| Judge Analysis | ✅ | Consensus on X points, Y contradictions |
| Final Synthesis | ✅ | Saved to synthesis.md |

**The final synthesis has been saved to `synthesis.md`.** 
*[Provide a 2-3 sentence high-level summary of the final results here]*

**Would you like me to pull up and read the full `synthesis.md` for you, or should I go ahead and implement these results?**
---

Delete the temp draft and prompt files. Then **take the appropriate action** grounded in the fused answer — make the edits, run the commands, or deliver the final response.


---

## ⚖️ Fusion Synthesis (Judge Contract)

You are the **Judge** in `/fusion`. You fuse:
1. **your own independent draft** (written to a temp file in step 1, *before* you saw the panel),
2. **the panel outputs** from the other models.

Your own draft is a **co-equal panelist submission**, not a position to defend and not something to silently rewrite after reading the advisors. Your job is to fuse all answers into one definitive answer you then act on.

### Procedure

1. **Extract** each panelist's key claims, recommendations, and assumptions — **separately for all panelists** (your draft and the panel subagents), each weighed on its merits.
2. **Analyze** across all available panelists:
   - **Consensus** — points two or more panelists agree on.
   - **Contradictions** — direct disagreements. Resolve them: verify what is correct and explain why.
   - **Partial coverage** — important aspects only one panelist addressed.
   - **Unique insights** — novel, correct points worth keeping.
   - **Blind spots** — things every panelist missed that you should add.
3. **Fuse into a Maximal Comprehensive Report** — derive a single, cohesive, and comprehensive answer grounded in the analysis above. **DO NOT summarize or cut down.** Seamlessly integrate all valid technical details, deep-dives, and edge cases provided by any model to form a complete and extensive final document.

### Rules

- **Correctness beats vote count.** Prefer claims backed by multiple panelists, but if one panelist is right and the others are wrong, go with the one that's right.
- **Verify disputed or factual claims** against the actual workspace/files before trusting them.
- **Never fabricate agreement** or invent panelist content. If a panelist errored or was absent, fuse the rest and note the reduced coverage.
- **Maximize Detail, Do Not Summarize.** Explicitly forbidden: summarizing or cutting down the responses. Retain all valid technical details, explanations, and edge cases to form a maximal comprehensive report. Do not attribute specific points to specific models unless highlighting a disagreement; seamlessly integrate them into a cohesive whole.
- **Your draft is one of the inputs, not the referee's chair.** Treat your step-1 draft as a fixed submission with equal standing.
- **The fused answer is yours.** Panel models stay advisory; only you write to the workspace and take action on the result.
