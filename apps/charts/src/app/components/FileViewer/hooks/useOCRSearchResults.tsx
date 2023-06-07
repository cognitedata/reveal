import { useEffect, useMemo, useState } from 'react';

import { FileInfo } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { OCRAnnotation } from '@cognite/unified-file-viewer';

import { retrieveOCRResults } from '../utils/retrieveOCRResults';

export type OCRSearchResponse = { annotations: OCRAnnotation[] };

export const useOCRSearchResults = (
  file: FileInfo | undefined,
  page: number,
  query: string
): {
  ocrSearchResultAnnotations: OCRAnnotation[];
  ocrResultsAvailable: boolean;
} => {
  const sdk = useSDK();
  const [ocrResponse, setOCRResponse] = useState<OCRSearchResponse[]>([]);

  useEffect(() => {
    (async () => {
      if (file?.id) {
        const ocrResults = await retrieveOCRResults(sdk, file?.id);
        setOCRResponse(ocrResults);
      }
    })();
  }, [file?.id]);

  const ocrSearchResultAnnotations = useMemo(() => {
    const currentPage = page ? page - 1 : 0;
    const currentPageOcrAnnotations =
      ocrResponse[currentPage]?.annotations ?? [];

    return currentPageOcrAnnotations.filter(
      (boundingBox) =>
        query.length !== 0 &&
        getSanitizedQueryPartials(query).some((partialQuery) =>
          boundingBox.text.toLowerCase().includes(partialQuery)
        )
    );
  }, [ocrResponse, page, query]);

  return {
    ocrSearchResultAnnotations,
    ocrResultsAvailable: Boolean(ocrResponse) && Boolean(ocrResponse.length),
  };
};

const getSanitizedQueryPartials = (query: string) => {
  return query
    .toLowerCase()
    .split(',') // separate query items by comma
    .map((partialQuery) => partialQuery.trim()) // trim white space
    .filter((partialQuery) => partialQuery !== ''); // remove empty string
};
