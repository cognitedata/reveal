/*!
 * Copyright 2025 Cognite AS
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getModels } from '../../../hooks/network/getModels';
import { type CogniteClient } from '@cognite/sdk';
import { type ModelWithRevisionInfo } from '../../../hooks/network/types';

export const useAllResourcesList = (
  sdk?: CogniteClient
): UseQueryResult<ModelWithRevisionInfo[]> => {
  return useQuery({
    queryKey: ['all-resources-list-1'],
    queryFn: async () => {
      return await getModels(sdk);
    },
    staleTime: Infinity
  });
};
