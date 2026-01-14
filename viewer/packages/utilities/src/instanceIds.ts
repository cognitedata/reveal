/*!
 * Copyright 2026 Cognite AS
 */
import { DataSourceType, InstanceReference } from '@reveal/data-providers';
import { dmInstanceRefToKey, isDmIdentifier } from './fdm';
import { IdEither, InternalId } from '@cognite/sdk';

export function isCogniteInternalId(id: IdEither): id is InternalId {
  return 'id' in id && id.id !== undefined;
}

export function getInstanceKey(instanceReference: InstanceReference<DataSourceType>): string {
  if (isDmIdentifier(instanceReference)) {
    return dmInstanceRefToKey(instanceReference);
  } else if (isCogniteInternalId(instanceReference)) {
    return `${instanceReference.id}`;
  } else {
    return instanceReference.externalId;
  }
}
