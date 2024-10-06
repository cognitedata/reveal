/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type CogniteClient, type HttpError, type Model3D } from '@cognite/sdk';
import { get3dModels } from './network/get3dModels';

export const useAll3dModels = (sdk: CogniteClient, enabled: boolean): UseQueryResult<Model3D[]> => {
  return useQuery<Model3D[], HttpError>({
    queryKey: ['models'],
    queryFn: async () => await get3dModels(sdk),
    staleTime: Infinity,
    enabled
  });
};
