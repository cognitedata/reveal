import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import { UseMutationOptions, useMutation, useQuery } from 'react-query';
import { useCreateSession } from './sessions';

// SOURCES

export type MQTTSourceType = 'mqtt3' | 'mqtt5';

type BaseMQTTSource = {
  externalId: string;
  type: MQTTSourceType;
  host: string;
  port?: string;
  username: string;
};

type ReadMQTTSource = BaseMQTTSource & {
  createdTime: number;
  lastUpdatedTime: number;
};

export type CreateMQTTSource = BaseMQTTSource & {
  password: string;
};

const getMQTTSourcesQueryKey = () => ['mqtt', 'source', 'list'];

export const useMQTTSources = () => {
  const sdk = useSDK();
  return useQuery(getMQTTSourcesQueryKey(), async () => {
    return sdk.get<{ items: ReadMQTTSource[] }>(
      `/api/v1/projects/${getProject()}/pluto/sources`,
      {
        headers: { 'cdf-version': 'alpha' },
      }
    );
  });
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

// DESTINATIONS

export type MQTTDestinationType = 'datapoints' | 'events' | 'raw';

type BaseMQTTDestination = {
  externalId: string;
  type: MQTTDestinationType;
};

type MQTTSessionCredentials = {
  nonce: string;
};

export type CreateMQTTDestination = BaseMQTTDestination & {
  credentials?: MQTTSessionCredentials;
};

type ReadMQTTDestination = BaseMQTTDestination & {
  createdTime: number;
  lastUpdatedTime: number;
  sessionId?: number;
};

type CreateMQTTDestinationVariables = Omit<
  CreateMQTTDestination,
  'credentials'
> & {
  clientId: string;
  clientSecret: string;
};

export const useCreateMQTTDestination = () => {
  const sdk = useSDK();

  const { mutateAsync: createSession } = useCreateSession();

  return useMutation(async (destination: CreateMQTTDestinationVariables) => {
    const session = await createSession({
      clientId: destination.clientId,
      clientSecret: destination.clientSecret,
    });

    return sdk
      .post<{ items: ReadMQTTDestination[] }>(
        `/api/v1/projects/${getProject()}/pluto/destinations`,
        {
          headers: { 'cdf-version': 'alpha' },
          data: {
            items: [
              {
                externalId: destination.externalId,
                type: destination.type,
                credentials: {
                  nonce: session.nonce,
                },
              },
            ],
          },
        }
      )
      .then((r) => r.data.items[0]);
  });
};

// JOBS

type MQTTFormatPrefixConfig = {
  fromTopic?: boolean;
  prefix?: string;
};

type MQTTFormat = {
  type: 'cognite';
  prefix?: MQTTFormatPrefixConfig;
};

type BaseMQTTJob = {
  externalId: string;
  topicFilter: string;
  format: MQTTFormat;
};

export type CreateMQTTJob = BaseMQTTJob & {
  destinationId: string;
  sourceId: string;
};

type CreateMQTTJobVariables = CreateMQTTJob;

export const useCreateMQTTJob = () => {
  const sdk = useSDK();

  return useMutation(async (job: CreateMQTTJobVariables) => {
    return sdk.post(`/api/v1/projects/${getProject()}/pluto/jobs`, {
      headers: { 'cdf-version': 'alpha' },
      data: {
        items: [job],
      },
    });
  });
};
