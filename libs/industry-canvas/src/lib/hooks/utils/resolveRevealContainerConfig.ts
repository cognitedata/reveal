import { CogniteClient } from '@cognite/sdk';
import { ContainerType } from '@cognite/unified-file-viewer';
import { v4 as uuid } from 'uuid';
import { IndustryCanvasContainerConfig } from '../../types';
import {
  DEFAULT_THREE_D_HEIGHT,
  DEFAULT_THREE_D_WIDTH,
} from '../../utils/addDimensionsToContainerReference';

const getAssetLabelById = async (
  sdk: CogniteClient,
  assetId: number
): Promise<string> => {
  const asset = await sdk.assets.retrieve([{ id: assetId }]);

  if (asset.length !== 1) {
    throw new Error('Expected to find exactly one asset');
  }

  return asset[0].name ?? asset[0].externalId;
};

const resolveRevealContainerConfig = async (
  sdk: CogniteClient,
  {
    id,
    modelId,
    revisionId,
    initialAssetId,
    camera,
    x,
    y,
    width,
    height,
  }: {
    id?: string | undefined;
    modelId: number;
    revisionId: number;
    initialAssetId?: number;
    camera?: {
      position: {
        x: number;
        y: number;
        z: number;
      };
      target: {
        x: number;
        y: number;
        z: number;
      };
    };
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }
): Promise<IndustryCanvasContainerConfig> => {
  const model = await sdk.models3D.retrieve(modelId);

  const maybeAssetName =
    initialAssetId !== undefined
      ? await getAssetLabelById(sdk, initialAssetId)
      : undefined;

  const modelLabel = model.name ?? model.id;

  const label = maybeAssetName
    ? `${modelLabel} - ${maybeAssetName}`
    : modelLabel;

  return {
    type: ContainerType.REVEAL,
    id: id || uuid(),
    label,
    modelId: modelId,
    revisionId: revisionId,
    initialAssetId: initialAssetId,
    camera: camera,
    x: x,
    y: y,
    width: width ?? DEFAULT_THREE_D_WIDTH,
    height: height ?? DEFAULT_THREE_D_HEIGHT,
    metadata: {},
  };
};

export default resolveRevealContainerConfig;
