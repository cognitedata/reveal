import { FileInfo, FileRequestFilter } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';
import { useAnnotationsForFiles } from 'hooks';
import { PENDING_LABEL } from './useReviewFiles';

export const useAnnotatedFiles = ({ filter = {} }: FileRequestFilter) => {
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
  const fileIds = (files ?? []).map((file: FileInfo) => file.id);
  const { files: annotatedFiles, isFetchingAnnotations } =
    useAnnotationsForFiles(fileIds);

  const isLoading = isFetchingFiles || isFetchingAnnotations;

  return { annotatedFiles, isError, isLoading };
};
