/*!
 * Copyright 2025 Cognite AS
 */
import { Image360RevisionId } from '../types';
import { DataSourceType } from '../DataSourceType';
import { Metadata } from '@cognite/sdk';
import {
  Image360DataModelIdentifier,
  Image360LegacyDataModelIdentifier
} from './descriptor-providers/datamodels/system-space/Cdf360DataModelsDescriptorProvider';
import { isDmIdentifier } from '@reveal/utilities';
import { DefaultImage360Collection, Image360Entity } from '@reveal/360-images';

const DEFAULT_MAX_WAIT_TIME_MS = 3000;
const DEFAULT_POLL_INTERVAL_MS = 50;

export function isClassicMetadata360Identifier(
  id: DataSourceType['image360Identifier']
): id is Metadata & { site_id: string } {
  return (id as Metadata).site_id !== undefined;
}

export function isClassic360Identifier(
  id: DataSourceType['image360Identifier']
): id is (Metadata & { site_id: string }) | Image360DataModelIdentifier {
  return isLegacyDM360Identifier(id) || isClassicMetadata360Identifier(id);
}

export function isLegacyDM360Identifier(
  id: DataSourceType['image360Identifier']
): id is Image360LegacyDataModelIdentifier {
  return (
    (id as Image360DataModelIdentifier).image360CollectionExternalId !== undefined &&
    (id as Image360DataModelIdentifier).space !== undefined &&
    ((id as Image360DataModelIdentifier).source === 'dm' || (id as Image360DataModelIdentifier).source === undefined)
  );
}

export function isCoreDmImage360Identifier(
  id: DataSourceType['image360Identifier']
): id is Image360DataModelIdentifier {
  return (
    (id as Image360DataModelIdentifier).image360CollectionExternalId !== undefined &&
    (id as Image360DataModelIdentifier).space !== undefined &&
    (id as Image360DataModelIdentifier).source === 'cdm'
  );
}
export function isFdm360ImageCollectionIdentifier(
  id: DataSourceType['image360Identifier']
): id is Image360DataModelIdentifier {
  return isLegacyDM360Identifier(id) || isCoreDmImage360Identifier(id);
}

export function isSameImage360RevisionId<T extends DataSourceType>(
  id0: Image360RevisionId<T>,
  id1: Image360RevisionId<T>
): boolean {
  if (isDmIdentifier(id0) && isDmIdentifier(id1)) {
    return id0.externalId === id1.externalId && id0.space === id1.space;
  } else if (typeof id0 === 'string' && typeof id1 === 'string') {
    return id0 === id1;
  }

  return false;
}

/**
 * Wait for entities to be available in the collection.
 * This handles the race condition where a query runs before the collection
 * has finished initializing its entities.
 * Returns a cloned array to protect against disposal during subsequent async operations.
 *
 * @param collection - The 360 image collection to wait for entities
 * @param maxWaitTimeMs - Maximum time to wait in milliseconds (default: 3000ms)
 * @param pollIntervalMs - Polling interval in milliseconds (default: 50ms)
 * @returns A cloned array of entities, or empty array if timeout
 */
export async function waitForCollectionEntities<T extends DataSourceType>(
  collection: DefaultImage360Collection<T>,
  maxWaitTimeMs: number = DEFAULT_MAX_WAIT_TIME_MS,
  pollIntervalMs: number = DEFAULT_POLL_INTERVAL_MS
): Promise<Image360Entity<T>[]> {
  // If entities are already available, return immediately (clone to protect against disposal)
  if (collection.image360Entities.length > 0) {
    return [...collection.image360Entities];
  }

  // Wait for entities to become available
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitTimeMs) {
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));

    if (collection.image360Entities.length > 0) {
      return [...collection.image360Entities];
    }
  }

  // Timeout - return empty (collection may be disposed or never initialized)
  return [];
}
