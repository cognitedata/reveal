import { useMemo } from 'react';

import { DeleteInstancesDTO, Result } from '@platypus/platypus-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOKENS } from '../../../../di';
import { useInjection } from '../../../../hooks/useInjection';
import { PlatypusError } from '../../../../types';
import { QueryKeys } from '../../../../utils/queryKeys';

export const useNodesDeleteMutation = () => {
  const aggregationsQueryKey = useMemo(
    () =>
      QueryKeys.PUBLISHED_ROWS_COUNT_BY_TYPE(
        'space',
        ' dataModelExternalId',
        'dataModelType?.name'
      ),
    []
  );
  const queryClient = useQueryClient();
  const deleteInstancesCommand = useInjection(TOKENS.deleteInstancesCommand);
  return useMutation<boolean, PlatypusError, DeleteInstancesDTO>(
    (dto) => {
      return deleteInstancesCommand.execute({ ...dto, type: 'node' });
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
};
