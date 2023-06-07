import { ContainerType } from '@cognite/unified-file-viewer';

import { IndustryCanvasContainerConfig } from '../../types';

const canContainerHaveOcrData = (
  containerConfig: IndustryCanvasContainerConfig
): boolean => {
  return (
    containerConfig.type === ContainerType.DOCUMENT ||
    containerConfig.type === ContainerType.IMAGE
  );
};

export default canContainerHaveOcrData;
