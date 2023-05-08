import { CogniteClient } from '@cognite/sdk';
import { ContainerType } from '@cognite/unified-file-viewer';
import { v4 as uuid } from 'uuid';
import {
  IndustryCanvasContainerConfig,
  ThreeDContainerReference,
} from '../../types';
import {
  DEFAULT_THREE_D_HEIGHT,
  DEFAULT_THREE_D_WIDTH,
} from '../../utils/addDimensionsToContainerReference';

const getAssetProperties = async (
  sdk: CogniteClient,
  assetId: number | undefined
): Promise<{
  name: string | undefined;
  externalId: string | undefined;
}> => {
  if (assetId === undefined) {
    return {
      name: undefined,
      externalId: undefined,
    };
  }

  const assets = await sdk.assets.retrieve([{ id: assetId }]);

  if (assets.length !== 1) {
    throw new Error('Expected to find exactly one asset');
  }

  return {
    name: assets[0].name,
    externalId: assets[0].externalId,
  };
};

const getModelProperties = async (
  sdk: CogniteClient,
  modelId: number
): Promise<{
  name: string | undefined;
}> => {
  const model = await sdk.models3D.retrieve(modelId);

  return {
    name: model.name,
  };
};

export const getDefaultRevealContainerLabel = (
  assetName: string | undefined,
  assetExternalId: string | undefined,
  modelName: string | undefined,
  modelId: number | undefined
): string => {
  const maybeAssetLabel = assetName ?? assetExternalId ?? undefined;
  const modelLabel = modelName ?? modelId ? String(modelId) : '';
  if (maybeAssetLabel) {
    return `${modelLabel} - ${maybeAssetLabel}`;
  }

  return modelLabel;
};

const getLabel = (
  label: string | undefined,
  assetName: string | undefined,
  assetExternalId: string | undefined,
  modelName: string | undefined,
  modelId: number
): string => {
  if (label) {
    return label;
  }

  return getDefaultRevealContainerLabel(
    assetName,
    assetExternalId,
    modelName,
    modelId
  );
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
    label,
  }: ThreeDContainerReference
): Promise<IndustryCanvasContainerConfig> => {
  const { name: assetName, externalId: assetExternalId } =
    await getAssetProperties(sdk, initialAssetId);
  const { name: modelName } = await getModelProperties(sdk, modelId);

  return {
    type: ContainerType.REVEAL,
    id: id || uuid(),
    label: getLabel(label, assetName, assetExternalId, modelName, modelId),
    modelId: modelId,
    revisionId: revisionId,
    initialAssetId: initialAssetId,
    camera: camera,
    x: x,
    y: y,
    width: width ?? DEFAULT_THREE_D_WIDTH,
    height: height ?? DEFAULT_THREE_D_HEIGHT,
    metadata: {
      assetName,
      assetExternalId,
      modelName,
      modelId,
      resourceType: 'threeD',
    },
  };
};

export default resolveRevealContainerConfig;
