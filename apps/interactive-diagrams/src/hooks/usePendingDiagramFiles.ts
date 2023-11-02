import { FileInfo, FileRequestFilter } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';

import { PENDING_LABEL } from './useReviewFiles';

export const usePendingDiagramFiles = ({ filter = {} }: FileRequestFilter) => {
  const {
    data: files,
    isError,
    isLoading,
  } = useList<FileInfo>('files', {
    filter: {
      ...filter,
      labels: { containsAny: [{ externalId: PENDING_LABEL.externalId }] },
    },
    limit: 1000,
  });

  return { files, isError, isLoading };
};
