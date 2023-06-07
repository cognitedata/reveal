import { useMemo } from 'react';

import { FileInfo } from '@cognite/sdk';
import {
  RectangleAnnotation,
  getAnnotationsFromContextApiOcrAnnotations,
} from '@cognite/unified-file-viewer';

import { usePnIdRawOCRResultQuery } from '../../service/queries/usePnIdRawOCRResultQuery';

export type SearchResult = {
  page: number; // 1-indexed page number
  annotation: RectangleAnnotation;
};

export const useSearchResults = ({
  file,
  query,
  enabled,
}: {
  file: FileInfo | undefined;
  query: string;
  enabled: boolean;
}): SearchResult[] | null => {
  const ocrResult = usePnIdRawOCRResultQuery(
    file,
    enabled && file !== undefined
  );

  const searchResults = useMemo(() => {
    if (ocrResult.isError) {
      return null;
    }
    const data = ocrResult.data;

    if (query === '' || file === undefined || data === undefined) {
      return [];
    }

    const containerId = String(file.id);

    return data.flatMap((pageData, pageIndex) => {
      const filteredOCRAnnotations = pageData.annotations.filter((box) =>
        getSanitizedQueryPartials(query).some((partialQuery) =>
          box.text.toLowerCase().includes(partialQuery)
        )
      );

      return getAnnotationsFromContextApiOcrAnnotations(
        filteredOCRAnnotations,
        containerId
      ).map((annotation) => ({ page: pageIndex + 1, annotation }));
    });
  }, [file, ocrResult.data, ocrResult.isError, query]);

  return searchResults;
};

const getSanitizedQueryPartials = (query: string): string[] => {
  return query
    .toLowerCase()
    .split(',') // separate query items by comma
    .map((partialQuery) => partialQuery.trim()) // trim white space
    .filter((partialQuery) => partialQuery !== ''); // remove empty string
};
