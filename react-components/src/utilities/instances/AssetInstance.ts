import { type Asset } from '@cognite/sdk';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import { type FdmNode } from '../../data-providers/FdmSDK';

export type AssetInstance = Asset | FdmNode<AssetProperties>;
