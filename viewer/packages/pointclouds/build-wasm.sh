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

WASM_BINDGEN_VERSION=$(grep -A2 '^name = "wasm-bindgen"$' "$WORKSPACE_DIR/Cargo.lock" | grep '^version' | head -1 | sed 's/version = "\(.*\)"/\1/')
if ! command -v wasm-bindgen &>/dev/null || [[ "$(wasm-bindgen --version 2>/dev/null | awk '{print $2}')" != "$WASM_BINDGEN_VERSION" ]]; then
  echo "Installing wasm-bindgen-cli $WASM_BINDGEN_VERSION..."
  cargo install wasm-bindgen-cli --version "$WASM_BINDGEN_VERSION" --locked
fi

if [[ "$COMMAND" == "test" ]]; then
  CARGO_TARGET_WASM32_UNKNOWN_UNKNOWN_RUNNER=wasm-bindgen-test-runner \
    cargo test --manifest-path "$WASM_DIR/Cargo.toml" --target wasm32-unknown-unknown -- "${TEST_FLAGS[@]}"
else
  cargo build --manifest-path "$WASM_DIR/Cargo.toml" --target wasm32-unknown-unknown --release

  mkdir -p "$WASM_DIR/pkg"
  wasm-bindgen \
    --target "$TARGET" \
    --out-dir "$WASM_DIR/pkg" \
    "$TARGET_DIR/wasm32-unknown-unknown/release/pointclouds_wasm.wasm"

  # wasm-bindgen does not generate package.json; write one so Node.js uses
  # the correct module system (CJS for nodejs target, ESM for everything else).
  if [[ "$TARGET" == "nodejs" ]]; then
    echo '{"name":"pointclouds-wasm","main":"pointclouds_wasm.js","types":"pointclouds_wasm.d.ts"}' \
      > "$WASM_DIR/pkg/package.json"
  else
    echo '{"name":"pointclouds-wasm","type":"module","main":"pointclouds_wasm.js","types":"pointclouds_wasm.d.ts"}' \
      > "$WASM_DIR/pkg/package.json"
  fi
fi
