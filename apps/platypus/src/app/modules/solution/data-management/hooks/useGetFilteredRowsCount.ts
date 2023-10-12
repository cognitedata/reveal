import { useEffect, useMemo, useState } from 'react';

import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { useQueryClient } from '@tanstack/react-query';

import { QueryKeys } from '../../../../utils/queryKeys';

export function useGetFilteredRowsCount({
  dataModelExternalId,
  dataModelType,
  space,
}: {
  dataModelExternalId: string;
  dataModelType: DataModelTypeDefsType;
  space: string;
}) {
  const [filteredRowsCount, setFilteredRowsCount] = useState<number>();
  const aggregationsQueryKey = useMemo(
    () =>
      QueryKeys.FILTERED_ROWS_COUNT(
        space,
        dataModelExternalId,
        dataModelType.name
      ),
    [space, dataModelExternalId, dataModelType.name]
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    const data = queryClient.getQueryData<number>(aggregationsQueryKey);
    if (data) {
      setFilteredRowsCount(data);
    }
  }, [aggregationsQueryKey, queryClient]);

  return filteredRowsCount;
}
