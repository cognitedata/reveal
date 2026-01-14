/*!
 * Copyright 2026 Cognite AS
 */
import { ExternalId, IdEither, InternalId } from '@cognite/sdk';
import { assertNever, dmInstanceRefToKey, isDmIdentifier } from '@reveal/utilities';
import { DataSourceType } from '../DataSourceType';
import { InstanceReference } from '../types';

function isCogniteInternalId(id: IdEither): id is InternalId {
  return 'id' in id && id.id !== undefined;
}

function isCogniteExternalId(id: IdEither): id is ExternalId {
  return 'externalId' in id && id.externalId !== undefined;
}

export function getInstanceKey(instanceReference: InstanceReference<DataSourceType>): string {
  if (isDmIdentifier(instanceReference)) {
    return dmInstanceRefToKey(instanceReference);
  } else if (isCogniteInternalId(instanceReference)) {
    return `${instanceReference.id}`;
  } else if (isCogniteExternalId(instanceReference)) {
    return instanceReference.externalId;
  }

  assertNever(instanceReference);
}
