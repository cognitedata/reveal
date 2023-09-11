import {
  DataModelTypeDefsType,
  IngestInstancesDTO,
  IngestInstancesResponseDTO,
} from '@platypus/platypus-core';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { PlatypusError } from '@platypus-app/types';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function usePublishRowMutation({
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
  return useMutation<
    IngestInstancesResponseDTO,
    PlatypusError,
    Omit<IngestInstancesDTO, 'type'>
  >(
    (dto) => {
      return dataManagementHandler.ingestNodes(dto);
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
            currentPublishedRowsCount + request.items.length
          );
        }
        queryClient.invalidateQueries(aggregationsQueryKey);
      },
    }
  );
}
