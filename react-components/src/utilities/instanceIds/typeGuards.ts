import { type ExternalId, type IdEither, type InternalId } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { type InstanceId } from './types';
import { type AssetId } from '../../components/CacheProvider/types';
import { type ClassicModelIdentifierType, type DMModelIdentifierType } from '@cognite/reveal';

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

export function isDMModelIdentifier(
  modelIdentifier: DMModelIdentifierType | ClassicModelIdentifierType
): modelIdentifier is DMModelIdentifierType {
  return 'revisionExternalId' in modelIdentifier && 'revisionSpace' in modelIdentifier;
}

export function isClassicModelIdentifier(
  modelIdentifier: DMModelIdentifierType | ClassicModelIdentifierType
): modelIdentifier is ClassicModelIdentifierType {
  return 'modelId' in modelIdentifier;
}
