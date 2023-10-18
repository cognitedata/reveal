import { useMemo } from 'react';

import {
  IngestInstancesDTO,
  IngestInstancesResponseDTO,
} from '@platypus/platypus-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDMContext } from '../../../../context/DMContext';
import { TOKENS } from '../../../../di';
import { useInjection } from '../../../../hooks/useInjection';
import { PlatypusError } from '../../../../types';
import { QueryKeys } from '../../../../utils/queryKeys';

export const usePublishRowMutation = () => {
  const {
    selectedDataType: dataModelType,
    selectedDataModel: { externalId: dataModelExternalId, space },
  } = useDMContext();
  const aggregationsQueryKey = useMemo(
    () =>
      QueryKeys.PUBLISHED_ROWS_COUNT_BY_TYPE(
        space,
        dataModelExternalId,
        dataModelType?.name
      ),
    [space, dataModelExternalId, dataModelType?.name]
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
};
