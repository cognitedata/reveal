import { useEffect, useMemo, useState } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { FileInfo } from '@cognite/sdk';
import {
  getAnnotationsFromContextApiOcrAnnotations,
  OCRAnnotation,
} from '@cognite/unified-file-viewer';
import { retrieveOCRResults } from '../utils/retrieveOCRResults';
import { FILE_CONTAINER_ID } from '../constants';

export const useSearchResultsToShow = (
  file: FileInfo | undefined,
  query: string
) => {
  const sdk = useSDK();
  const [ocrAnnotations, setOCRAnnotations] = useState<OCRAnnotation[]>([]);

  useEffect(() => {
    (async () => {
      if (file && query !== '') {
        setOCRAnnotations(await retrieveOCRResults(sdk, file.id));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, query, setOCRAnnotations]);

  const searchResultAnnotations = useMemo(() => {
    const filteredOCRAnnotations = ocrAnnotations.filter(
      (box) =>
        query.length !== 0 &&
        query
          .toLowerCase()
          .split(',')
          .some((el) => box.text.toLowerCase().includes(el))
    );
    return getAnnotationsFromContextApiOcrAnnotations(
      filteredOCRAnnotations,
      FILE_CONTAINER_ID
    );
  }, [ocrAnnotations, query]);

  return { searchResultAnnotations };
};
