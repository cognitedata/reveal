import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { PlatypusError } from '@platypus-app/types';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import {
  DataModelTypeDefsType,
  DmsDeleteNodesRequestDTO,
  Result,
} from '@platypus/platypus-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useNodesDeleteMutation({
  dataModelExternalId,
  dataModelType,
}: {
  dataModelExternalId: string;
  dataModelType: DataModelTypeDefsType;
}) {
  const aggregationsQueryKey = QueryKeys.PUBLISHED_ROW_COUNT(
    dataModelExternalId,
    dataModelType.name
  );
  const queryClient = useQueryClient();
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  return useMutation<Result<boolean>, PlatypusError, DmsDeleteNodesRequestDTO>(
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
