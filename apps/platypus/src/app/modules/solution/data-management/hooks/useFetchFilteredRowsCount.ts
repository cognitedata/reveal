import {
  DataModelTypeDefsType,
  FetchFilteredRowsCountDTO,
  Result,
} from '@platypus/platypus-core';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { PlatypusError } from '@platypus-app/types';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useFetchFilteredRowsCount({
  dataModelExternalId,
  dataModelType,
  space,
}: {
  dataModelExternalId: string;
  dataModelType: DataModelTypeDefsType;
  space: string;
}) {
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const aggregationsQueryKey = QueryKeys.FILTERED_ROWS_COUNT(
    space,
    dataModelExternalId,
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
