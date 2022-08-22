/*!
 * Copyright 2022 Cognite AS
 */

import init, { add_three } from './pkg/reveal_rust_wasm';
import wasm from './pkg/reveal_rust_wasm_bg.wasm';

function getWasmInitPromise(): Promise<void> {
  return typeof init === 'function' ? (init as ((buffer: any) => Promise<any>))(wasm).then(() => {}) : Promise.resolve();
}

export async function addThree(input: number): Promise<number> {
  const wasmPromise = getWasmInitPromise();
  return wasmPromise.then(() => add_three(input));
}
