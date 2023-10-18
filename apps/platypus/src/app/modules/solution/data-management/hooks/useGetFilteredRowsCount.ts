import { useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useDMContext } from '../../../../context/DMContext';
import { QueryKeys } from '../../../../utils/queryKeys';

export function useGetFilteredRowsCount() {
  const {
    selectedDataType: dataModelType,
    selectedDataModel: { externalId: dataModelExternalId, space },
  } = useDMContext();
  const [filteredRowsCount, setFilteredRowsCount] = useState<number>();
  const aggregationsQueryKey = useMemo(
    () =>
      QueryKeys.FILTERED_ROWS_COUNT(
        space,
        dataModelExternalId,
        dataModelType?.name || ''
      ),
    [space, dataModelExternalId, dataModelType]
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
