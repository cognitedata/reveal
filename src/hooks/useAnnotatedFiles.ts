import { FileInfo, FileRequestFilter } from '@cognite/cdf-sdk-singleton';
import { useList } from '@cognite/sdk-react-query-hooks';
import { useFileWithAnnotations } from 'hooks';
import { PENDING_LABEL } from './useReviewFiles';

export const useAnnotatedFiles = ({ filter }: FileRequestFilter) => {
  const {
    data: files,
    isError,
    isLoading: isFetchingFiles,
  } = useList<FileInfo>('files', {
    filter: {
      ...filter,
      labels: { containsAny: [{ externalId: PENDING_LABEL.externalId }] },
    },
  });

  const { files: annotatedFiles, isFetching: isFetchingAnnotations } =
    useFileWithAnnotations(files ?? []);

  const isLoading = isFetchingFiles || isFetchingAnnotations;

  return { annotatedFiles, isError, isLoading };
};
