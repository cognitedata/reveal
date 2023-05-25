import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';
import { FileInfo } from '@cognite/sdk';
import { OCRAnnotationPageResult } from '../../types';
import { retrievePnIdRawOCRResult } from '../network/retrievePnIdRawOCRResult';

export const usePnIdRawOCRResultQuery = (
  file?: FileInfo,
  enabled?: boolean
) => {
  const sdk = useSDK();

  const result = useQuery(
    ['pnidocr', file?.id],
    (): Promise<OCRAnnotationPageResult[]> => {
      if (!file?.id) {
        return Promise.resolve([]);
      }
      return retrievePnIdRawOCRResult(sdk, file.id);
    },
    {
      enabled,
      staleTime: Infinity,
    }
  );

  return result;
};
