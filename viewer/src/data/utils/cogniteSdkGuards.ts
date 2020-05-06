/*!
 * Copyright 2020 Cognite AS
 */

import { InternalId, ExternalId } from '@cognite/sdk';

export function instanceOfInternalId(object: any): object is InternalId {
  return 'id' in object;
}

export function instanceOfExternalId(object: any): object is ExternalId {
  return 'externalId' in object;
}
