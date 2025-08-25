import { type ExternalId, type IdEither, type InternalId } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { type InstanceId } from './types';
import { type AssetId } from '../../components/CacheProvider/types';

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

export function isClassicInstanceId(instanceId: InstanceId): instanceId is AssetId {
  return typeof instanceId === 'number';
}
