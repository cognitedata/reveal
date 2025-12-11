/*!
 * Copyright 2025 Cognite AS
 */

export function safeParseInt(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}
