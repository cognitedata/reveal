/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type CogniteClient, type HttpError, type Model3D } from '@cognite/sdk';
import { useFetchModels } from './useFetchModels';

export const useAll3dModels = (sdk: CogniteClient, enabled: boolean): UseQueryResult<Model3D[]> => {
  return useQuery<Model3D[], HttpError>({
    queryKey: ['models'],
    queryFn: async () => await useFetchModels(sdk),
    staleTime: Infinity,
    enabled
  });
};
