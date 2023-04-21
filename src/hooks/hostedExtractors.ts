import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import { useMutation, useQuery } from 'react-query';

// SOURCES

type MQTTSourceType = 'mqtt3' | 'mqtt5';

type BaseMQTTSource = {
  externalId: string;
  type: MQTTSourceType;
  host?: string;
  port?: string;
  username: string;
};

type ReadMQTTSource = BaseMQTTSource & {
  createdTime: number;
  lastUpdatedTime: number;
};

type CreateMQTTSource = BaseMQTTSource & {
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

export const useCreateMQTTSource = () => {
  const sdk = useSDK();

  return useMutation(async (source: CreateMQTTSourceVariables) => {
    return sdk.post(`/api/v1/projects/${getProject()}/pluto/sources`, {
      data: {
        items: [source],
      },
    });
  });
};

// DESTINATIONS

type MQTTDestinationType = 'datapoints' | 'events' | 'raw';

type BaseMQTTDestination = {
  externalId: string;
  type: MQTTDestinationType;
};

type MQTTSessionCredentials = {
  nonce: string;
};

type CreateMQTTDestination = BaseMQTTDestination & {
  credentials?: MQTTSessionCredentials;
};

type CreateMQTTDestinationVariables = CreateMQTTDestination;

export const useCreateMQTTDestination = () => {
  const sdk = useSDK();

  return useMutation(async (destination: CreateMQTTDestinationVariables) => {
    return sdk.post(`/api/v1/projects/${getProject()}/pluto/destinations`, {
      data: {
        items: [destination],
      },
    });
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

type CreateMQTTJob = BaseMQTTJob & {
  destinationId: string;
  sourceId: string;
};

type CreateMQTTJobVariables = CreateMQTTJob;

export const useCreateMQTTJob = () => {
  const sdk = useSDK();

  return useMutation(async (job: CreateMQTTJobVariables) => {
    return sdk.post(`/api/v1/projects/${getProject()}/pluto/jobs`, {
      data: {
        items: [job],
      },
    });
  });
};
