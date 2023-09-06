#!/bin/bash

# Define the directory paths for language files and the English (en) file.
LANG_FILE_NAME="data-exploration.json"
LANG_DIR="src/i18n"
EN_FILE="$LANG_DIR/en/$LANG_FILE_NAME"

# Check if the English file exists.
if [ ! -f "$EN_FILE" ]; then
  echo "English translation file not found: $EN_FILE"
  exit 1
fi

# Get the language keys of English.
EN_LANG_KEYS=$(jq -r 'keys[]' "$EN_FILE" | sort)

# Loop through each language directory
for lang_dir in $LANG_DIR/*; do
  if [ -d "$lang_dir" ]; then
    lang_code=$(basename "$lang_dir")

    # Check if the language file exists
    lang_file="$lang_dir/$LANG_FILE_NAME"
    
    # Comparing keys
    lang_keys=$(jq -r 'keys[]' "$lang_file" | sort)
      
    # Find missing keys (keys that exist in "English" but not in the current language)
    missing_keys=$(comm -23 <(printf "%s\n" "${EN_LANG_KEYS[@]}") <(printf "%s\n" "${lang_keys[@]}"))

    # Find removed keys (keys that exist in the current language but not in "English")
    removed_keys=$(comm -13 <(printf "%s\n" "${EN_LANG_KEYS[@]}" | sort) <(printf "%s\n" "${lang_keys[@]}" | sort))

    if [ -n "$missing_keys" ]; then
      echo "=============================="
      echo "Keys not translated to \"$lang_code\":"
      echo "=============================="
      echo "$missing_keys"
      echo ""
    fi

    if [ -n "$removed_keys" ]; then
      echo "========================="
      echo "Keys to remove in \"$lang_code\":"
      echo "========================="
      echo "$removed_keys"
      echo ""
    fi
  fi
done
