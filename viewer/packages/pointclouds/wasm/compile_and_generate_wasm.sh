cargo build --release --target=wasm32-unknown-unknown && wasm-bindgen --out-dir=pkg --target=web --omit-default-module-path target/wasm32-unknown-unknown/release/reveal_rust_wasm.wasm
