import { Asset, CogniteInternalId } from '@cognite/sdk';

export type AssetNode = {
  asset: Asset;
  children?: CogniteInternalId[];
  isLeaf?: boolean;
  isLoadingChildren?: boolean;
  nextCursor?: string;
};
