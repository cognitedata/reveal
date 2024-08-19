import { FdmKey } from '../../components/CacheProvider/types';
import { DmsUniqueIdentifier } from '../FdmSDK';

export function toFdmKey(dmsId: DmsUniqueIdentifier): FdmKey {
  return `${dmsId.space}/${dmsId.externalId}`;
}
