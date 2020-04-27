/* istanbul ignore file */
/*!
 * Copyright 2020 Cognite AS
 */

export async function waitUntill(condition: () => boolean): Promise<void> {
  while (!condition()) {
    await yieldProcessing();
  }
}

export async function yieldProcessing(): Promise<void> {
  await new Promise<void>(resolve => setImmediate(resolve));
}

export async function sleep(milliseconds: number): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, milliseconds));
}
