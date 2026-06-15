#!/bin/bash
# Ensure gum is installed for the TUI rendering
if ! command -v gum &> /dev/null; then
    echo "Installing gum for UI rendering..."
    brew install gum || sudo apt install gum -y
fi

clear
echo "⚙️  Configuring Local Fusion Engine"
echo "-----------------------------------"

# Render the interactive TUI checklist
SELECTED_MODELS=$(gum choose --no-limit --cursor=">" \
  --header="Select the models you want in your panel (Space to select, Enter to confirm):" \
  "gemini-3.5-flash" \
  "gemini-3-pro" \
  "claude-sonnet-4.5" \
  "gpt-oss" \
  "deepseek-coder" \
  "+ Add Custom API Model...")

mkdir -p ~/.antigravity/state/
echo "$SELECTED_MODELS" > ~/.antigravity/state/fusion_panel_prefs.txt

if echo "$SELECTED_MODELS" | grep -q "+ Add Custom API Model..."; then
    echo ""
    gum style --foreground 212 "🛠️  Configuring Custom API Model"
    
    CUSTOM_MODEL_NAME=$(gum input --placeholder "Enter Model Name (e.g., custom-codex, claude-code)...")
    CUSTOM_API_URL=$(gum input --placeholder "Enter API Base URL (e.g., https://api.openai.com/v1)...")
    CUSTOM_API_KEY=$(gum input --password --placeholder "Enter API Key...")

    # Save custom model config
    cat <<EOF > ~/.antigravity/state/fusion_custom_model.json
{
  "model_name": "$CUSTOM_MODEL_NAME",
  "base_url": "$CUSTOM_API_URL",
  "api_key": "$CUSTOM_API_KEY"
}
EOF
    echo ""
    gum style --foreground 212 "✅ Custom API Model '$CUSTOM_MODEL_NAME' saved!"
else
    # clear custom model config if not selected to avoid stale data
    rm -f ~/.antigravity/state/fusion_custom_model.json
fi

echo ""
gum style --foreground 212 "✅ Fusion Panel successfully updated!"
gum style --foreground 240 "Active subagents:"
echo "$SELECTED_MODELS" | grep -v "+ Add Custom API Model..."
if [ -f ~/.antigravity/state/fusion_custom_model.json ]; then
    echo "$CUSTOM_MODEL_NAME (Custom API)"
fi
sleep 2
clear
