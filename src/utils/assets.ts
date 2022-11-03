import { createLink } from '@cognite/cdf-utilities';
import { Asset } from '@cognite/sdk';

export const openAssetInNewTab = (rootAsset: Asset) => {
  window.open(createLink(`/explore/asset/${rootAsset.id}`), '_blank');
};
