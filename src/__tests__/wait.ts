export async function waitUntill(condition: () => boolean): Promise<void> {
  while (!condition()) {
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  }
}