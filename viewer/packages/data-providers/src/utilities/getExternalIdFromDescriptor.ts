/*!
 * Copyright 2025 Cognite AS
 */

import { Image360FileDescriptor } from '../types';

/**
 * Gets the externalId from a file descriptor, if available.
 * Works with both direct externalId and instanceId.externalId.
 */
export function getExternalIdFromDescriptor(desc: Image360FileDescriptor): string | undefined {
  if ('externalId' in desc && desc.externalId !== undefined) {
    return desc.externalId;
  }
  if ('instanceId' in desc && desc.instanceId !== undefined) {
    return desc.instanceId.externalId;
  }
  return undefined;
}
