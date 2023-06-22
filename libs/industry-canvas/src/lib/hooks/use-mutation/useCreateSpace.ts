import { captureException } from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { QueryKeys, TOAST_POSITION } from '../../constants';
import { delayMs } from '../../utils/delayMs';
import { listSpaces } from '../use-query/useListSpaces';

export type SpaceDefinition = {
  space: string;
  description: string;
  name: string;
  createdTime: number;
  lastUpdatedTime: number;
  isGlobal: boolean;
};

export type SpaceCreateDefinition = Pick<
  SpaceDefinition,
  'space' | 'description' | 'name'
>;

const CREATE_SPACE_DELAY_TIME_MS = 2000;

export const useCreateSpaceMutation = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useMutation(
    [QueryKeys.CREATE_SPACE],
    async (spaceDefinition: SpaceCreateDefinition) => {
      const response = await sdk.post<{ items: SpaceDefinition[] }>(
        `/api/v1/projects/${sdk.project}/models/spaces`,
        {
          data: { items: [spaceDefinition] },
        }
      );
      // This is an artificial delay we add for the following reasons:
      // 1) It gives the FDM backend some time to process that a new space has been created.
      // 2) From a UX perspective, it actually feels more safe if the requests
      //    takes a while. It gives the feeling that something is happening behind the scenes.
      await delayMs(CREATE_SPACE_DELAY_TIME_MS);
      return response.data.items;
    },
    {
      onError: (err) => {
        captureException(err);
        toast.error('Failed to create space for Industrial Canvas', {
          toastId: 'industry-canvas-create-space-error',
          position: TOAST_POSITION,
        });
      },
      onSuccess: async () => {
        // NOTE: For some reason, after creating a new space, the first
        // immediate call to `GET /models/spaces`, does not contain the newly
        // created space. The workaround is to manually call the list endpoint
        // after the space is successfully created, so that the subsequent
        // call(s) we make to the list endpoint (e.g., after we invalidate the
        // LIST_SPACES query) will contain the newly created space.
        await listSpaces(sdk);
        queryClient.invalidateQueries({ queryKey: [QueryKeys.LIST_SPACES] });
      },
    }
  );
};
