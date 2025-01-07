/*!
 * Copyright 2025 Cognite AS
 */
import { DMInstanceRef } from './types';

export function isDmIdentifier(id: any): id is DMInstanceRef {
  return (id as DMInstanceRef).externalId !== undefined && (id as DMInstanceRef).space !== undefined;
}
