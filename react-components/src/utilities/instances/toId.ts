/*!
 * Copyright 2025 Cognite AS
 */
import { assertNever } from '../assertNever';
import { type InstanceReference } from '../instanceIds';
import { type AssetInstance } from './AssetInstance';
import { isClassicAsset, isDmAsset } from './typeGuards';

export function getAssetInstanceReference(instance: AssetInstance): InstanceReference {
  if (isDmAsset(instance)) {
    return { externalId: instance.externalId, space: instance.space };
  } else if (isClassicAsset(instance)) {
    return { id: instance.id, externalId: instance.externalId };
  }

  assertNever(instance);
}
