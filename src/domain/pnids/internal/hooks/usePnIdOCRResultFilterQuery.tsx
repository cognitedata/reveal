import { useMemo } from 'react';
import { FileInfo } from '@cognite/sdk';
import { getAnnotationsFromContextApiOcrAnnotations } from '@cognite/unified-file-viewer';
import { usePnIdRawOCRResultQuery } from '../../service/queries/usePnIdRawOCRResultQuery';

export const usePnIdOCRResultFilterQuery = (
  query: string,
  containerId: string,
  file?: FileInfo
) => {
  const { data } = usePnIdRawOCRResultQuery(file, !!file && query !== '');

  const annotationSearchResult = useMemo(() => {
    if (data?.length) {
      const filteredOCRAnnotations = data?.filter(
        box =>
          query.length !== 0 &&
          query
            .toLowerCase()
            .split(',')
            .some(partialQuery => box.text.toLowerCase().includes(partialQuery))
      );
      const ufvAnnotations = getAnnotationsFromContextApiOcrAnnotations(
        filteredOCRAnnotations,
        containerId
      );
      return ufvAnnotations;
    }
    return [];
  }, [data, query, containerId]);

  return { annotationSearchResult };
};
