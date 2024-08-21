/*!
 * Copyright 2024 Cognite AS
 */
import { type FdmKey } from '../../components/CacheProvider/types';
import { type DmsUniqueIdentifier } from '../FdmSDK';

export function toFdmKey(dmsId: DmsUniqueIdentifier): FdmKey {
  return `${dmsId.space}/${dmsId.externalId}`;
}
