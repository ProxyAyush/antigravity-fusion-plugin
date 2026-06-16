# Universal Fusion Plugin 🧠

Multi-model fusion for Google Antigravity CLI. Ask multiple models (e.g. Gemini 3.5 Flash, Gemini 3.1 Pro, etc.) in parallel, then judge their answers into one and act on it.

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

For Antigravity CLI:
```bash
git clone https://github.com/ProxyAyush/antigravity-fusion-plugin.git
agy plugin install ./antigravity-fusion-plugin
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
| `/fusion <task>` | Ask multiple models in parallel, synthesize one fused answer, then act on it. |
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
/fusion:config set Gemini 3.5 Flash (High), Gemini 3.1 Pro (High) # Overwrite preferences
```

Or edit the file directly (`~/.fusion_panel_prefs.txt`):

```text
Gemini 3.5 Flash (High)
Gemini 3.1 Pro (High)
Gemini 3.5 Flash (Medium)
```

> [!NOTE]
> Any model supported by your CLI environment (such as Claude Sonnet, Opus, or GPT-OSS models returned by `agy models`) can be configured as panel advisors.


## 💡 Architecture & Community Notes

- **Automated Blind-Drafting**: In response to early community architecture reviews, we are actively transitioning away from hardcoded global preferences (`~/.fusion_panel_prefs.txt`) toward repository-governed configurations (`.fusion.json`) and automated task-specific blind-drafting presets.
- **Task Log Auditing for Large Contexts**: During deep research or long coding sessions, subagent outputs can become extremely large, leading to terminal truncation. The orchestrator now writes complete, untruncated subagent traces directly to temporary task log files (e.g., `/tmp/agy-task-*.log`), which are read in full by the Judge model before performing final synthesis.
- **Isolated Execution**: We run subagents in parallel with the print-mode flag (`--print`), instructing them to act strictly in a read-only advisory capacity. This allows them to analyze project structure without causing race conditions or generating conflicting file writes.

---

## ❓ FAQ

<details>
<summary>▶️ Who is the judge model and how can I change it?</summary>
<br>
The Judge Model is simply the model you currently have active in your CLI window when you run the `/fusion` command. To change the judge model, just switch your active model in the CLI before invoking fusion. For example, if you want Gemini 3.1 Pro (High) to judge Gemini 3.5 Flash, just select Gemini 3.1 Pro (High) as your active CLI model!
</details>

<details>
<summary>▶️ How can I easily change the models inside the fusion panel?</summary>
<br>
You can easily adjust settings using the `/fusion:config set` command or edit `~/.fusion_panel_prefs.txt`.
</details>

<details>
<summary>▶️ Where does the final synthesized answer go?</summary>
<br>
To keep your chat clean, the full synthesis is saved to a `synthesis.md` file in your current working directory. In the chat, you will see a telemetry table showing step-by-step model status (responses vs errors), followed by a 2-3 sentence high-level summary of the findings. The agent will then ask: 
*“Would you like me to pull up and read the full synthesis.md for you, or should I go ahead and implement these results?”*

If you choose to read, the agent will load and show `synthesis.md` using its viewing tools. If you choose to implement, the agent will proactively start writing files and executing commands based on the panel's consensus.
</details>

<details>
<summary>▶️ Doesn't Antigravity natively force subagents to inherit the main model type? How do you bypass this?</summary>
<br>
Spot on. One of the core limitations of native CLI subagents is that they are bound to the parent agent's active model architecture. 

To circumvent this, the Fusion plugin acts as a **Meta-Orchestrator**. Instead of calling the native tool, it triggers your host terminal execution tool to spin up completely detached background bash subprocesses (`agy --model "[Advisor Model]" --print "Prompt" > /tmp/fusion_[model].txt &`). This forces separate agentic processes to execute under entirely distinct configurations, which are then clean-read and aggregated into your active session.
</details>

<details>
<summary>▶️ Can advisor models call tools or make destructive file edits in parallel?</summary>
<br>
No. To prevent repository chaos, conflicting edits, or infinite tool-calling loops, the panel advisors are strictly restricted to a <b>read-only advisory role</b>. They are invoked using print-mode execution wrappers and prompt injections that strip workspace-modifying capabilities. The heavy thinking happens in parallel, but the primary Judge model is the sole authority permitted to execute file writes or workspace commands.
</details>

<details>
<summary>▶️ Is the performance boost just an expensive pass@N brute-force effect?</summary>
<br>
It's a common misconception to equate this with a standard <code>pass@3</code> run. In a single-model multiple-pass configuration, you are evaluating identical architectural biases and training distributions multiple times. 

Fusion runs diverse model architectures (e.g., Anthropic, Google, DeepSeek) in parallel. Each brings a completely distinct "way of thinking" and localized dataset optimization to the problem. The Judge isn't just looking for a majority vote; it is performing a semantic synthesis to bridge contradictions and catch blind spots before execution.
</details>

<details>
<summary>▶️ Does it make sense to fuse models from the same family (e.g., Gemini 3.1 Pro + Gemini 3.5 Flash)?</summary>
<br>
For optimal results, <b>mix your model families</b>. If the underlying training data and architectural lineage are nearly identical, the models share the same systemic blind spots, yielding little behavioral advantage. The real "fusion edge" occurs when you introduce cross-vendor dataset diversity—combining different provider strengths to eliminate localized model hallucinations.
</details>

<details>
<summary>▶️ The DRACO benchmark targets Deep Research. Does Fusion actually benefit hard coding?</summary>
<br>
Yes, but it shifts where the value is delivered. While standalone frontier reasoning models excel at fluid, inline code generation, Fusion is built for the critical <b>planning, structural architecture, and debugging alignment</b> stages. By forcing a multi-model council to audit your project blueprint before a single line of code is written, you drastically minimize project drift and optimize your token efficiency during downstream development.
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
