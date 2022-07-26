/**
 * See https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#union-exhaustiveness-checking
 */
function assertNever(x: never, message?: string): never {
  throw new Error(message || `Unexpected object: ${x}`);
}

export default assertNever;
