#!/usr/bin/env bash
set -e

# Usage:
#   build-wasm.sh build --target <web|nodejs> <wasm-dir>
#   build-wasm.sh test [--headless] [--chrome|--firefox|--safari|--node] <wasm-dir>
# Minimal replacement for wasm-pack using cargo + wasm-bindgen-cli directly.

COMMAND="build"
if [[ "$1" == "build" || "$1" == "test" ]]; then
  COMMAND="$1"
  shift
fi

TARGET="web"
WASM_DIR="./wasm"
TEST_FLAGS=()

while [[ $# -gt 0 ]]; do
  case $1 in
    --target) TARGET="$2"; shift 2 ;;
    --headless|--chrome|--firefox|--safari|--node) TEST_FLAGS+=("$1"); shift ;;
    *) WASM_DIR="$1"; shift ;;
  esac
done

WORKSPACE_TOML=$(cargo locate-project --workspace --message-format plain --manifest-path "$WASM_DIR/Cargo.toml")
WORKSPACE_DIR=$(dirname "$WORKSPACE_TOML")
TARGET_DIR="$WORKSPACE_DIR/target"

rustup target add wasm32-unknown-unknown 2>/dev/null || true

WASM_BINDGEN_VERSION=$(cargo metadata --manifest-path "$WASM_DIR/Cargo.toml" --format-version 1 2>/dev/null \
  | python3 -c "import sys,json; print(next(p['version'] for p in json.load(sys.stdin)['packages'] if p['name']=='wasm-bindgen'))")
if ! command -v wasm-bindgen &>/dev/null || [[ "$(wasm-bindgen --version 2>/dev/null | awk '{print $2}')" != "$WASM_BINDGEN_VERSION" ]]; then
  echo "Installing wasm-bindgen-cli $WASM_BINDGEN_VERSION..."
  cargo install wasm-bindgen-cli --version "$WASM_BINDGEN_VERSION" --locked
fi

if [[ "$COMMAND" == "test" ]]; then
  CARGO_TARGET_WASM32_UNKNOWN_UNKNOWN_RUNNER=wasm-bindgen-test-runner \
    cargo test --manifest-path "$WASM_DIR/Cargo.toml" --target wasm32-unknown-unknown -- "${TEST_FLAGS[@]}"
else
  # Derive names from Cargo.toml so the script is not tied to a specific crate.
  CRATE_NAME=$(sed -n 's/^name = "\(.*\)"/\1/p' "$WASM_DIR/Cargo.toml" | head -1)
  LIB_NAME=$(echo "$CRATE_NAME" | tr '-' '_')
  CRATE_VERSION=$(sed -n 's/^version = "\(.*\)"/\1/p' "$WASM_DIR/Cargo.toml" | head -1)

  cargo build --manifest-path "$WASM_DIR/Cargo.toml" --target wasm32-unknown-unknown --release

  mkdir -p "$WASM_DIR/pkg"
  wasm-bindgen \
    --target "$TARGET" \
    --out-dir "$WASM_DIR/pkg" \
    "$TARGET_DIR/wasm32-unknown-unknown/release/${LIB_NAME}.wasm"

  # wasm-bindgen does not generate package.json; write one so Node.js uses
  # the correct module system (CJS for nodejs target, ESM for everything else).
  if [[ "$TARGET" == "nodejs" ]]; then
    printf '{"name":"%s","version":"%s","main":"%s.js","types":"%s.d.ts","sideEffects":false}\n' \
      "$CRATE_NAME" "$CRATE_VERSION" "$LIB_NAME" "$LIB_NAME" > "$WASM_DIR/pkg/package.json"
  else
    printf '{"name":"%s","version":"%s","type":"module","main":"%s.js","types":"%s.d.ts","sideEffects":false}\n' \
      "$CRATE_NAME" "$CRATE_VERSION" "$LIB_NAME" "$LIB_NAME" > "$WASM_DIR/pkg/package.json"
  fi
fi
