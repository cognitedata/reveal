import { useMemo } from 'react';
import { FileInfo } from '@cognite/sdk';
import { getAnnotationsFromContextApiOcrAnnotations } from '@cognite/unified-file-viewer';
import { getContainerId } from '../../../../containers/Files/FilePreview/FilePreviewUFV/utils';
import { usePnIdRawOCRResultQuery } from '../../service/queries/usePnIdRawOCRResultQuery';

export const usePnIdOCRResultFilterQuery = (query: string, file?: FileInfo) => {
  const { data } = usePnIdRawOCRResultQuery(file, !!file && query !== '');

  const annotationSearchResult = useMemo(() => {
    if (file === undefined) {
      return [];
    }

    const containerId = getContainerId(file.id);
    if (data === undefined || data?.length === length) {
      return [];
    }

    const filteredOCRAnnotations = data?.filter(
      box =>
        query.length !== 0 &&
        query
          .toLowerCase()
          .split(',')
          .some(partialQuery => box.text.toLowerCase().includes(partialQuery))
    );

    return getAnnotationsFromContextApiOcrAnnotations(
      filteredOCRAnnotations,
      containerId
    );
  }, [file, data, query]);

  return { annotationSearchResult };
};
