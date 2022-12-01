import { useEffect, useMemo, useState } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { FileInfo } from '@cognite/sdk';
import { OCRAnnotation } from '@cognite/unified-file-viewer';
import { retrieveOCRResults } from '../utils/retrieveOCRResults';

export const useOCRSearchResults = (
  file: FileInfo | undefined,
  query: string
): { ocrSearchResultAnnotations: OCRAnnotation[] } => {
  const sdk = useSDK();
  const [ocrAnnotations, setOCRAnnotations] = useState<OCRAnnotation[]>([]);

  useEffect(() => {
    (async () => {
      if (file && query !== '') {
        const ocrResults = await retrieveOCRResults(sdk, file.id);
        setOCRAnnotations(ocrResults);
      }
    })();
  }, [file, query, setOCRAnnotations]);

  const ocrSearchResultAnnotations = useMemo(
    () =>
      ocrAnnotations.filter(
        (boundingBox) =>
          query.length !== 0 &&
          query
            .toLowerCase()
            .split(',')
            .some((el) => boundingBox.text.toLowerCase().includes(el))
      ),
    [ocrAnnotations, query]
  );

  return { ocrSearchResultAnnotations };
};
