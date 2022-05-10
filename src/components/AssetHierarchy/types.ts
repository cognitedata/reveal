import { Asset, CogniteInternalId } from '@cognite/sdk';

export type AssetNodeState = {
  asset: Asset;
  childrenIds?: CogniteInternalId[];
  expanded?: boolean;
  selected?: boolean;
  childrenExpanded?: boolean;
  isLeaf?: boolean;
  isLoadingChildren?: boolean;
  nextCursor?: string;
};

export type ViewMoreNodeState = {
  viewMoreNode: boolean;
  parentId: CogniteInternalId;
  isLoadingChildren?: boolean;
};

export const TREE_UPDATE_TYPE = {
  SELECT: 3,
  EXPAND_COLLAPSE: 4,
  LOAD_MORE: 5,
};
