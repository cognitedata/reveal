import { retrievePnIdRawOCRResult } from '@data-exploration-lib/domain-layer';
import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { IndustryCanvasContainerConfig } from '../../types';

import canContainerHaveOcrData from './canContainerHaveOcrData';

const useContainerOcrData = (
  containerConfig: IndustryCanvasContainerConfig | undefined
) => {
  const sdk = useSDK();
  return useQuery(
    [
      `ocr-data-${containerConfig?.type}-${containerConfig?.metadata.resourceId}`,
    ],
    () => {
      if (containerConfig?.metadata.resourceId === undefined) {
        return undefined;
      }

      return retrievePnIdRawOCRResult(sdk, containerConfig.metadata.resourceId);
    },
    {
      enabled:
        containerConfig !== undefined &&
        canContainerHaveOcrData(containerConfig),
    }
  );
};

export default useContainerOcrData;
