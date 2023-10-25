import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useAnnotations = (
  fileId: number,
  options?: { enabled?: boolean }
) => {
  const sdk = useSDK();

  const result = useQuery(
    [`annotations-file-${fileId}`],
    () =>
      sdk.annotations
        .list({
          filter: {
            annotatedResourceType: 'file',
            annotatedResourceIds: [{ id: fileId }],
          },
        })
        .autoPagingToArray({ limit: Infinity }),
    { ...options }
  );
  return {
    ...result,
    data: result.data ?? [],
  };
};