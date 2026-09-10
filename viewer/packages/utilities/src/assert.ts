/*!
 * Copyright 2026 Cognite AS
 */

/**
 * Whatever gets passed into the condition parameter must be true if the assert returns. That means that for the rest of the scope, that condition must be truthy from the perspective of the type checker.
 * Adapted from {@link https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions}
 *
 * @param condition - A condition which is guaranteed to be true for the rest of the calling scope after this function returns.
 * @param msg - The message which should be included in the error given that the condition fails.
 */
export function assert(condition: unknown, msg?: string): asserts condition {
  if (!Boolean(condition)) {
    throw new Error(msg);
  }
}
