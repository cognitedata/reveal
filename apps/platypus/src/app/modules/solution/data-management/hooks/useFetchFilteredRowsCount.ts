import {
  DataModelTypeDefsType,
  FetchFilteredRowsCountDTO,
  Result,
} from '@platypus/platypus-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDMContext } from '../../../../context/DMContext';
import { TOKENS } from '../../../../di';
import { useInjection } from '../../../../hooks/useInjection';
import { PlatypusError } from '../../../../types';
import { QueryKeys } from '../../../../utils/queryKeys';

export function useFetchFilteredRowsCount({
  dataModelType,
}: {
  dataModelType: DataModelTypeDefsType;
}) {
  const { selectedDataModel } = useDMContext();
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const aggregationsQueryKey = QueryKeys.FILTERED_ROWS_COUNT(
    selectedDataModel.space,
    selectedDataModel.externalId,
    dataModelType.name
  );
  const queryClient = useQueryClient();

  return useMutation<Result<number>, PlatypusError, FetchFilteredRowsCountDTO>(
    (dto) => {
      return dataManagementHandler.fetchFilteredRowsCount(dto);
    },
    {
      onSuccess: (result) => {
        queryClient.setQueryData(aggregationsQueryKey, result.getValue());
        queryClient.invalidateQueries(aggregationsQueryKey);
      },
    }
  );
}
