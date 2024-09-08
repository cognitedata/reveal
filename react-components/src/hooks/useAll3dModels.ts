/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type CogniteClient, type HttpError, type Model3D } from '@cognite/sdk';

const fetchModels = async (sdk: CogniteClient): Promise<Model3D[]> => {
  return await sdk.models3D.list().autoPagingToArray({ limit: Infinity });
};

export function useAll3dModels(sdk: CogniteClient, enabled: boolean): UseQueryResult<Model3D[]> {
  return useQuery<Model3D[], HttpError>({
    queryKey: ['models'],
    queryFn: async () => await fetchModels(sdk),
    staleTime: Infinity,
    enabled
  });
}
