import { useQuery } from '@tanstack/react-query';

import { CogniteClient, HttpError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { QueryKeys } from '../../constants';
import { SpaceDefinition } from '../use-mutation/useCreateSpace';

export const NUM_SPACES_LIMIT = 1000;

export const listSpaces = async (
  sdk: CogniteClient,
  limit: number = NUM_SPACES_LIMIT
): Promise<SpaceDefinition[]> => {
  const response = await sdk.get<{ items: SpaceDefinition[] }>(
    `/api/v1/projects/${sdk.project}/models/spaces`,
    { params: { limit } }
  );
  return response.data.items;
};

export const useListSpaces = () => {
  const sdk = useSDK();
  return useQuery<SpaceDefinition[], HttpError>(
    [QueryKeys.LIST_SPACES],
    async () => listSpaces(sdk)
  );
};
