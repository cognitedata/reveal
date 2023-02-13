import { useMemo } from 'react';
import { FileInfo } from '@cognite/sdk';
import {
  Annotation,
  getAnnotationsFromContextApiOcrAnnotations,
} from '@cognite/unified-file-viewer';
import { usePnIdRawOCRResultQuery } from '../../service/queries/usePnIdRawOCRResultQuery';

export const useSearchInContainer = (
  file: FileInfo | undefined,
  page: number | undefined,
  query: string,
  enabled = true
): { searchResultAnnotations: Annotation[] } => {
  const { data } = usePnIdRawOCRResultQuery(file, enabled && !!file);

  const searchResultAnnotations = useMemo(() => {
    if (file === undefined) {
      return [];
    }

    if (data === undefined || data?.length === 0) {
      return [];
    }
    const currentPage = page ? page - 1 : 0;

    const currentPageData = data[currentPage];
    if (currentPageData === undefined) {
      return [];
    }

    const currentPageDataAnnotations = currentPageData.annotations;
    const filteredOCRAnnotations = currentPageDataAnnotations.filter(
      (box) =>
        query.length !== 0 &&
        getSanitizedQueryPartials(query).some((partialQuery) =>
          box.text.toLowerCase().includes(partialQuery)
        )
    );

    const containerId = String(file.id);
    return getAnnotationsFromContextApiOcrAnnotations(
      filteredOCRAnnotations,
      containerId
    );
  }, [file, data, query, page]);

  return {
    searchResultAnnotations,
  };
};

const getSanitizedQueryPartials = (query: string): string[] => {
  return query
    .toLowerCase()
    .split(',') // separate query items by comma
    .map((partialQuery) => partialQuery.trim()) // trim white space
    .filter((partialQuery) => partialQuery !== ''); // remove empty string
};
