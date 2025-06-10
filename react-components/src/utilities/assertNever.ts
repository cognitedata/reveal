export function assertNever(x: never, message?: string): never {
  throw new Error(message ?? 'Unexpected object: ' + (x as any));
}
