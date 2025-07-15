import { type IdEither } from '@cognite/sdk';
import { type DmsUniqueIdentifier, type Source } from '../../data-providers';
import type { AssetId, FdmKey } from '../../components/CacheProvider/types';

export type FdmInstanceWithView = DmsUniqueIdentifier & { view: Source };

export type InstanceReference = IdEither | DmsUniqueIdentifier;

export type InstanceId = AssetId | DmsUniqueIdentifier;

export type InstanceKey = AssetId | FdmKey;
