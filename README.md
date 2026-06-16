# Universal Fusion Plugin 🧠

Multi-model fusion for Antigravity, Claude Code, and Codex CLI. Ask multiple models (e.g. Gemini 3.5 Flash, Gemini 3.1 Pro, Claude Sonnet, etc.) in parallel, then judge their answers into one and act on it.

> *“The more tokens you throw at SOTA models, the better the answer.*
> *Cast your prompt into a solitary mind, and you receive a mere response.*
> *But weave a million tokens across a chorus of State-of-the-Art intellects, and you uncover the truth.”*

![DRACO benchmark scores](1781544730189.png)

[📸 View an Example Run in the CLI](IMG_20260615_185839.jpg)

---

## 🌟 Inspiration

Fusion is inspired by OpenRouter's [**Fusion beats Frontier**](https://openrouter.ai/blog/announcements/fusion-beats-frontier/): dispatch a prompt to a panel of models, then have a judge synthesize their answers into one response that beats any single frontier model. This plugin brings that pattern locally. The panel subagents answer as read-only advisors, and their answers are judged and fused into one before the main model acts on it.

More Benchmarking coming soon! 

---

## 🚀 Installation

Because Fusion is purely prompt-and-skill-driven, you can install it into any modern agentic CLI.

### For Antigravity CLI
```bash
git clone https://github.com/ProxyAyush/antigravity-fusion-plugin.git
agy plugin install ./antigravity-fusion-plugin
```

### For Claude Code
```bash
/plugin marketplace add /path/to/antigravity-fusion-plugin
/plugin install fusion@fusion
```

### For Codex CLI
```bash
/plugin marketplace add /path/to/antigravity-fusion-plugin
/plugin install fusion@fusion
```

---

## ⚡ Quick Start & Setup

Run the setup command to check available models and configure your panel:

```bash
/fusion:setup
```

It will detect available models and help you configure your preference file: `~/.fusion_panel_prefs.txt`.

---

## 📖 Commands

| Command | What it does |
| --- | --- |
| `/fusion:fuse <task>` | Ask multiple models in parallel, synthesize one fused answer, then act on it. |
| `/fusion:setup` | Check available models in your CLI and verify preferences. |
| `/fusion:config [show \| set <models>]` | View or change settings (model panel configuration) in your preference file. |

*To invoke fusion quickly, simply type `/fusion` followed by your prompt!*

---

## 🔒 How advisors stay read-only

Only the main model (the active CLI session) modifies your workspace. Subagent processes are instructed via prompt injection to act as read-only advisors and are invoked with print-mode execution to prevent writing to files or running workspace-modifying commands.

---

## ⚙️ Configuration

Easiest way to change settings is the `config` command:

```bash
/fusion:config show                       # Show configured models
/fusion:config set Gemini 3.5 Flash (High), Claude Sonnet 4.6 (Thinking) # Overwrite preferences
```

Or edit the file directly (`~/.fusion_panel_prefs.txt`):

```text
Gemini 3.5 Flash (High)
Gemini 3.1 Pro (High)
Claude Sonnet 4.6 (Thinking)
```

---

## ❓ FAQ

<details>
<summary>▶️ Who is the judge model and how can I change it?</summary>
<br>
The Judge Model is simply the model you currently have active in your CLI window when you run the `/fusion` command. To change the judge model, just switch your active model in the CLI before invoking fusion. For example, if you want Claude to judge Gemini and GPT, just select Claude as your active CLI model!
</details>

<details>
<summary>▶️ How can I easily change the models inside the fusion panel?</summary>
<br>
You can easily adjust settings using the `/fusion:config set` command or edit `~/.fusion_panel_prefs.txt`.
</details>

<details>
<summary>▶️ Can this be used in other CLIs like Claude Code and Codex?</summary>
<br>
Yes! Fusion is fully compatible with Claude Code, Codex, and Antigravity. It registers standard slash commands and runs completely locally using standard plugin mechanisms.
</details>

<details>
<summary>▶️ Where does the final synthesized answer go?</summary>
<br>
To keep your chat clean, the full synthesis is saved to a `synthesis.md` file in your current working directory. In the chat, you will see a telemetry table showing step-by-step model status (responses vs errors), followed by a 2-3 sentence high-level summary of the findings. The agent will then ask: 
*“Would you like me to pull up and read the full synthesis.md for you, or should I go ahead and implement these results?”*

If you choose to read, the agent will load and show `synthesis.md` using its viewing tools. If you choose to implement, the agent will proactively start writing files and executing commands based on the panel's consensus.
</details>

<details>
<summary>▶️ Does this actually call different API models under the hood?</summary>
<br>
Yes! To bypass the limitations of CLI subagents inheriting the parent model, the Fusion orchestrator spins up actual parallel background subprocesses of the host CLI with different model parameters (e.g. `agy --model "[Model Name]"`). This forces separate agentic runs to execute under different model configurations/endpoints, which are then read, analyzed, and synthesized by the Judge.
</details>

---

## 📄 License

MIT — see [LICENSE](./LICENSE).


## Star History

<a href="https://www.star-history.com/?repos=ProxyAyush%2Fantigravity-fusion-plugin&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=ProxyAyush/antigravity-fusion-plugin&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=ProxyAyush/antigravity-fusion-plugin&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=ProxyAyush/antigravity-fusion-plugin&type=date&legend=top-left" />
 </picture>
</a>
