import { captureException } from '@sentry/react';
import { useMutation } from '@tanstack/react-query';

import { toast } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { QueryKeys, TOAST_POSITION } from '../../constants';

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

export const useCreateSpaceMutation = () => {
  const sdk = useSDK();
  return useMutation(
    [QueryKeys.CREATE_SPACE],
    async (spaceDefinition: SpaceCreateDefinition) => {
      const response = await sdk.post<{ items: SpaceDefinition[] }>(
        `/api/v1/projects/${sdk.project}/models/spaces`,
        {
          data: { items: [spaceDefinition] },
        }
      );
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
    }
  );
};
