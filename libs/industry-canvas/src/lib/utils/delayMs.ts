export const delayMs = async (delayTimeMs: number) =>
  await new Promise((r) => setTimeout(r, delayTimeMs));
