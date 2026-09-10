/*!
 * Copyright 2025 Cognite AS
 */
import type { DMInstanceRef } from './types';

export function isDmIdentifier(id: unknown): id is DMInstanceRef {
  return (
    typeof id === 'object' &&
    id !== null &&
    'externalId' in id &&
    'space' in id &&
    typeof id.externalId === 'string' &&
    typeof id.space === 'string'
  );
}
