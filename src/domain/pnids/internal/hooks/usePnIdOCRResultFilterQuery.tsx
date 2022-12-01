import { useMemo } from 'react';
import { FileInfo } from '@cognite/sdk';
import { getAnnotationsFromContextApiOcrAnnotations } from '@cognite/unified-file-viewer';
import { getContainerId } from '../../../../containers/Files/FilePreview/FilePreviewUFV/utils';
import { usePnIdRawOCRResultQuery } from '../../service/queries/usePnIdRawOCRResultQuery';

export const usePnIdOCRResultFilterQuery = (
  query: string,
  file?: FileInfo,
  page?: number,
  enabled = true
) => {
  const { data } = usePnIdRawOCRResultQuery(file, enabled && !!file);

  const annotationSearchResult = useMemo(() => {
    if (file === undefined) {
      return [];
    }

    const containerId = getContainerId(file.id);
    if (data === undefined || data?.length === length) {
      return [];
    }
    const currentPage = page ? page - 1 : 0;

    const currentPageData = data[currentPage]?.annotations ?? [];

    const filteredOCRAnnotations = currentPageData?.filter(
      box =>
        query.length !== 0 &&
        getSanitizedQueryPartials(query).some(partialQuery =>
          box.text.toLowerCase().includes(partialQuery)
        )
    );

    return getAnnotationsFromContextApiOcrAnnotations(
      filteredOCRAnnotations,
      containerId
    );
  }, [file, data, query, page]);

  return {
    annotationSearchResult,
    resultsAvailable: Boolean(data) && Boolean(data?.length),
  };
};

const getSanitizedQueryPartials = (query: string): string[] => {
  return query
    .toLowerCase()
    .split(',') // separate query items by comma
    .map(partialQuery => partialQuery.trim()) // trim white space
    .filter(partialQuery => partialQuery !== ''); // remove empty string
};
