import { ContainerType } from '@cognite/unified-file-viewer';
import { getDefaultRevealContainerLabel } from '../hooks/utils/resolveRevealContainerConfig';
import { IndustryCanvasContainerConfig } from '../types';

const getDefaultContainerLabel = (container: IndustryCanvasContainerConfig) => {
  if (
    container.type === ContainerType.DOCUMENT ||
    container.type === ContainerType.IMAGE ||
    container.type === ContainerType.TEXT ||
    container.type === ContainerType.TIMESERIES ||
    container.type === ContainerType.TABLE
  ) {
    return container.metadata.name ?? container.metadata.externalId;
  }

  if (container.type === ContainerType.REVEAL) {
    return getDefaultRevealContainerLabel(
      container.metadata.assetName,
      container.metadata.assetExternalId,
      container.metadata.modelName,
      container.metadata.modelId
    );
  }

  return '';
};

export default getDefaultContainerLabel;
