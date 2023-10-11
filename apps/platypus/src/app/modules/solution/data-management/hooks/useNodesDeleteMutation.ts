import {
  DataModelTypeDefsType,
  DeleteInstancesDTO,
  Result,
} from '@platypus/platypus-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOKENS } from '../../../../di';
import { useInjection } from '../../../../hooks/useInjection';
import { PlatypusError } from '../../../../types';
import { QueryKeys } from '../../../../utils/queryKeys';

export function useNodesDeleteMutation({
  dataModelExternalId,
  dataModelType,
  space,
}: {
  dataModelExternalId: string;
  dataModelType: DataModelTypeDefsType;
  space: string;
}) {
  const aggregationsQueryKey = QueryKeys.PUBLISHED_ROWS_COUNT_BY_TYPE(
    space,
    dataModelExternalId,
    dataModelType.name
  );
  const queryClient = useQueryClient();
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  return useMutation<Result<boolean>, PlatypusError, DeleteInstancesDTO>(
    (dto) => {
      return dataManagementHandler.deleteData(dto);
    },
    {
      onSuccess: (_, request) => {
        const currentPublishedRowsCount =
          queryClient.getQueryData(aggregationsQueryKey);
        if (
          typeof currentPublishedRowsCount === 'number' &&
          Number.isInteger(currentPublishedRowsCount)
        ) {
          queryClient.setQueryData(
            aggregationsQueryKey,
            currentPublishedRowsCount - request.items.length
          );
        }
        queryClient.invalidateQueries(aggregationsQueryKey);
      },
    }
  );
}
