/*!
 * Copyright 2020 Cognite AS
 */

/**
 * See https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#union-exhaustiveness-checking
 */
export function assertNever(x: never, message?: string): never {
  throw new Error(message || 'Unexpected object: ' + x);
}
