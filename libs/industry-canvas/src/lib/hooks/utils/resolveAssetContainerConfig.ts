import { v4 as uuid } from 'uuid';

import { CogniteClient } from '@cognite/sdk';
import { ContainerType } from '@cognite/unified-file-viewer';

import {
  AssetContainerReference,
  IndustryCanvasContainerConfig,
} from '../../types';
import {
  DEFAULT_ASSET_HEIGHT,
  DEFAULT_ASSET_WIDTH,
} from '../../utils/addDimensionsToContainerReference';

const resolveAssetContainerConfig = async (
  sdk: CogniteClient,
  { id, resourceId, x, y, width, height, label }: AssetContainerReference
): Promise<IndustryCanvasContainerConfig> => {
  const assets = await sdk.assets.retrieve([{ id: resourceId }]);

  if (assets.length !== 1) {
    throw new Error('Expected to find exactly one asset');
  }

  const asset = assets[0];

  return {
    id: id || uuid(),
    type: ContainerType.ASSET,
    label: label ?? asset.name ?? asset.externalId,
    x: x,
    y: y,
    width: width ?? DEFAULT_ASSET_WIDTH,
    height: height ?? DEFAULT_ASSET_HEIGHT,
    assetId: resourceId,
    metadata: {
      resourceId,
      resourceType: 'asset',
      name: asset.name,
      externalId: asset.externalId,
    },
  };
};

export default resolveAssetContainerConfig;
