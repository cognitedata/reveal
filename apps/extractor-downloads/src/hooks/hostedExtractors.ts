import { UseMutationOptions, useMutation } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';

export type MQTTSourceType = 'mqtt3' | 'mqtt5';

export type BaseMQTTSource = {
  externalId: string;
  type: MQTTSourceType;
  host: string;
  port?: string;
  username?: string;
};

export type ReadMQTTSource = BaseMQTTSource & {
  createdTime: number;
  lastUpdatedTime: number;
};

export type CreateMQTTSource = BaseMQTTSource & {
  password?: string;
  useTls?: boolean;
};

type CreateMQTTSourceVariables = CreateMQTTSource;

export const useCreateMQTTSource = (
  options?: UseMutationOptions<unknown, unknown, CreateMQTTSourceVariables>
) => {
  const sdk = useSDK();

  return useMutation(async (source: CreateMQTTSourceVariables) => {
    return sdk
      .post<{ items: ReadMQTTSource[] }>(
        `/api/v1/projects/${getProject()}/pluto/sources`,
        {
          headers: { 'cdf-version': 'alpha' },
          data: {
            items: [source],
          },
        }
      )
      .then((r) => r.data.items[0]);
  }, options);
};
