import { useMemo } from 'react';

import isUndefined from 'lodash/isUndefined';

import { useReverseLookupAnnotationsQuery } from '../../service';

export const useAnnotatedFileIdsOfAsset = ({
  assetId,
  limit,
  enabled = true,
}: {
  assetId: number;
  limit?: number;
  enabled?: boolean;
}) => {
  const { data, ...rest } = useReverseLookupAnnotationsQuery(
    {
      filter: {
        annotatedResourceType: 'file',
        data: {
          assetRef: {
            id: assetId,
          },
        },
      },
      limit,
    },
    { enabled }
  );

  const fileIds = useMemo(() => {
    return data
      .map(({ id }) => id)
      .filter((id) => !isUndefined(id)) as number[];
  }, [data]);

  return {
    data: fileIds,
    ...rest,
  };
};
