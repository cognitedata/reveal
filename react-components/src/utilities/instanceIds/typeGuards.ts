/*!
 * Copyright 2025 Cognite AS
 */
import { type ExternalId, type IdEither, type InternalId } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../data-providers';
import {
  type AssetInstanceReference,
  type AssetHybridInstanceReference,
  type InstanceReference
} from './types';

export type AnnotationAssetRef = { id?: number; externalId?: string };

export function isIdEither(instance: unknown): instance is IdEither {
  return isExternalId(instance) || isInternalId(instance);
}

export function isExternalId(idEither: unknown): idEither is ExternalId {
  return (
    typeof idEither === 'object' &&
    idEither !== null &&
    'externalId' in idEither &&
    !('space' in idEither)
  );
}

export function isInternalId(idEither: unknown): idEither is InternalId {
  return typeof idEither === 'object' && idEither !== null && 'id' in idEither;
}

export function isDmsInstance(instance: unknown): instance is DmsUniqueIdentifier {
  return (
    typeof instance === 'object' &&
    instance !== null &&
    'externalId' in instance &&
    'space' in instance
  );
}

export function isHybridAssetMappingsInstance(
  instance: InstanceReference
): instance is AssetHybridInstanceReference {
  return 'assetInstanceId' in instance && isDmsInstance(instance.assetInstanceId);
}

export function isAssetInstanceReference(
  instance: InstanceReference
): instance is AssetInstanceReference {
  return 'assetId' in instance;
}
