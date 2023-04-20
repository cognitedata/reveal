import { CogniteClient } from '@cognite/sdk';
import getAssetTableContainerConfig from './getAssetTableContainerConfig';
import { IndustryCanvasContainerConfig } from '../../types';
import {
  DEFAULT_ASSET_HEIGHT,
  DEFAULT_ASSET_WIDTH,
} from '../../utils/addDimensionsToContainerReference';
import { v4 as uuid } from 'uuid';

const resolveAssetContainerConfig = async (
  sdk: CogniteClient,
  {
    id,
    resourceId,
    x,
    y,
    width,
    height,
    label,
  }: {
    id?: string | undefined;
    resourceId: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    label?: string;
  }
): Promise<IndustryCanvasContainerConfig> => {
  const assets = await sdk.assets.retrieve([{ id: resourceId }]);

  if (assets.length !== 1) {
    throw new Error('Expected to find exactly one asset');
  }

  const asset = assets[0];

  return {
    ...(await getAssetTableContainerConfig(
      sdk as any,
      {
        id: id || uuid(),
        label: label ?? asset.name ?? asset.externalId,
        x: x,
        y: y,
        width: width ?? DEFAULT_ASSET_WIDTH,
        height: height ?? DEFAULT_ASSET_HEIGHT,
      },
      {
        assetId: resourceId,
      }
    )),
    metadata: {
      resourceId,
      name: asset.name,
      externalId: asset.externalId,
    },
  } as IndustryCanvasContainerConfig;
};

export default resolveAssetContainerConfig;
