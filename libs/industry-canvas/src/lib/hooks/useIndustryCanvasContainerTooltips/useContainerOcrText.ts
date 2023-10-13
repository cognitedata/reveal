import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { IndustryCanvasContainerConfig } from '../../types';

import canContainerHaveOcrData from './canContainerHaveOcrData';

const useContainerOcrText = (
  containerConfig: IndustryCanvasContainerConfig | undefined
) => {
  const sdk = useSDK();
  return useQuery(
    [
      `ocr-data-${containerConfig?.type}-${containerConfig?.metadata.resourceId}`,
    ],
    async () => {
      if (containerConfig?.metadata.resourceId === undefined) {
        return undefined;
      }
      try {
        return sdk.documents.content(containerConfig.metadata.resourceId);
      } catch {
        return undefined;
      }
    },
    {
      enabled:
        containerConfig !== undefined &&
        canContainerHaveOcrData(containerConfig),
    }
  );
};

export default useContainerOcrText;
