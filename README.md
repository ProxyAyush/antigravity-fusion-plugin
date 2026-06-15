# Antigravity Fusion Plugin

Multi-model fusion for the Antigravity CLI. Fan out your prompt to a panel of models, synthesize the best answer, get per-model telemetry. Inspired by [OpenRouter's Fusion](https://openrouter.ai/docs/guides/features/plugins/fusion).

![Surpassing Frontier Performance with Fusion](https://openrouter.ai/blog/images/blog/fusion-benchmark.jpg)

## 🌟 Features
- **Skill-based invocation**: Just type `use fusion` or `/fusion` followed by your prompt — no model switching needed.
- **Interactive TUI config**: Run the config script to pick your panel models via a visual checklist (requires `gum`).
- **Custom API support**: Bring any external model (Claude Code, Codex, local LLMs) via API key + base URL.
- **Multi-agent fan-out**: Spawns parallel subagents across Gemini, Claude, GPT-OSS, etc.
- **Judge synthesis**: Identifies consensus, contradictions, unique insights, and blind spots across all responses.
- **Per-model telemetry**: Every run ends with a ✅/❌ health table showing exactly what happened.

## 📊 Why Fusion Works

OpenRouter's DRACO benchmark proved that panels of models consistently outperform individual models — even budget panels beat frontier models.

![DRACO benchmark scores](https://openrouter.ai/blog/images/blog/fusion-benchmark-chart.png)

![Score vs cost](https://openrouter.ai/blog/images/blog/fusion-benchmark-cost.png)

## 🚀 Installation

```bash
git clone https://github.com/ProxyAyush/antigravity-fusion-plugin.git
agy plugin install ./antigravity-fusion-plugin
```

## 📖 Usage

### Quick start
Just type this in any Antigravity chat:
```
use fusion: What's the best architecture for a Solarpunk game engine?
```

### Configure your panel
Run the TUI to pick which models are in your panel:
```bash
bash ~/.gemini/config/plugins/openrouter-fusion-local/scripts/configure_panel.sh
```

Or manually edit `~/.antigravity/state/fusion_panel_prefs.txt` (one model per line):
```
gemini-3.5-flash
claude-sonnet-4.5
gpt-oss
```

### Add a custom API model
Run the TUI and select `+ Add Custom API Model...` to enter a model name, base URL, and API key for any external provider.

### Telemetry
Every fusion run ends with a per-model health table:
```
⚙️ Fusion Telemetry
| Step               | Status | Details                              |
|--------------------|--------|--------------------------------------|
| Panel Config       | ✅     | 3 models loaded from prefs           |
| gemini-3.5-flash   | ✅     | Subagent returned (1.2s)             |
| claude-sonnet-4.5  | ✅     | Subagent returned (2.4s)             |
| gpt-oss            | ❌     | Timeout after 30s                    |
| Judge Analysis     | ✅     | Consensus on 4 points, 1 contradiction |
| Final Synthesis    | ✅     | Grounded in 2/3 responses            |
```

The last 5 runs are stored in `~/.antigravity/state/fusion_telemetry.log`.

## 🛠 Structure
```
antigravity-fusion-plugin/
├── plugin.json
├── skills/
│   └── fusion.md             # The orchestrator skill
└── scripts/
    └── configure_panel.sh    # Interactive TUI for model selection
```

## 📚 References
- [OpenRouter Fusion API Docs](https://openrouter.ai/docs/guides/features/plugins/fusion)
- [Fusion Beats Frontier Benchmark](https://openrouter.ai/blog/announcements/fusion-beats-frontier/)
