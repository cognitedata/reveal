/*!
 * Copyright 2021 Cognite AS
 */
export function measureTime(operation: () => void): number {
  const start = performance.now();
  operation();
  return performance.now() - start;
}
