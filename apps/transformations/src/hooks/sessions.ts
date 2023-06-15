import { useCallback } from 'react';

import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { BASE_QUERY_KEY } from '@transformations/common';

import { getToken } from '@cognite/cdf-sdk-singleton';
import { getCluster, getProject, getUrl } from '@cognite/cdf-utilities';
import { CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const getSessionsListQueryKey = () => [
  BASE_QUERY_KEY,
  'sessions',
  'list',
];

function getSessionsUrl(opts?: {
  project?: string;
  api?: string;
  cursor?: string;
}) {
  const { project = getProject(), api = 'v1', cursor } = opts || {};

  return `/api/${api}/projects/${project}/sessions${
    cursor ? `cursor=${cursor}` : ''
  }`;
}

export const useSession = (
  { id, project }: { id: number; project: string },
  opts?: Omit<UseQueryOptions<Session>, 'queryKey' | 'queryFn'>
) => {
  const sharedSDKInstance = useSDK();

  return useQuery(
    ['sessions', id, project],
    async () => {
      const sdk = await getSDKForSessionHooks(project, sharedSDKInstance);

      return sdk
        .post<{ items: Session[] }>(`${getSessionsUrl({ project })}/byids`, {
          data: { items: [{ id }] },
        })
        .then((r) => r.data.items[0] as Session);
    },
    opts
  );
};

export type Session = {
  id: number;
  type: 'CLIENT_CREDENTIALS';
  status:
    | 'READY'
    | 'ACTIVE'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'REVOKED'
    | 'ACCESS_LOST';
  clientId: string;
  nonce: string;
};

type SessionCredentials =
  | { tokenExchange: true }
  | { clientId: string; clientSecret: string };
type CreateSessionOpts = {
  credentials: SessionCredentials;
  project: string | undefined;
};

export const useTestCredentials = () => {
  const sharedSDKInstance = useSDK();

  const { mutateAsync: revokeSession } = useRevokeSession();

  const callback = useCallback(
    async ({ project = '', credentials }: CreateSessionOpts) => {
      const sdk = await getSDKForSessionHooks(project, sharedSDKInstance);

      try {
        const res = await sdk.post<{ items: Session[] }>(
          getSessionsUrl({ project }),
          {
            data: {
              items: [credentials],
            },
          }
        );
        const session = res.data.items[0];
        revokeSession({ id: session.id, project });
        return true;
      } catch (e) {
        return false;
      }
    },
    [revokeSession, sharedSDKInstance]
  );

  return callback;
};

export const useCreateSession = () => {
  const sharedSDKInstance = useSDK();

  return useMutation(
    async ({ project = '', credentials }: CreateSessionOpts) => {
      const sdk = await getSDKForSessionHooks(project, sharedSDKInstance);
      return sdk
        .post<{ items: Session[] }>(getSessionsUrl({ project }), {
          data: {
            items: [credentials],
          },
        })
        .then((r) => r.data.items[0]);
    }
  );
};

export const useRevokeSession = () => {
  const sharedSDKInstance = useSDK();

  return useMutation(
    async ({ id, project }: { id: number; project: string }) => {
      const sdk = await getSDKForSessionHooks(project, sharedSDKInstance);
      return sdk
        .post<{ items: Session[] }>(`${getSessionsUrl({ project })}/revoke`, {
          data: {
            items: [{ id }],
          },
        })
        .then((r) => r.data.items[0]);
    }
  );
};

const getSDKForSessionHooks = async (
  project: string = getProject(),
  sharedSDKInstance: CogniteClient
): Promise<CogniteClient> => {
  if (project === getProject()) {
    return sharedSDKInstance;
  }

  const cluster = getCluster();
  const newSDKInstance = new CogniteClient({
    getToken,
    project,
    appId: 'Fusion Transformation',
    baseUrl: cluster ? getUrl(cluster) : undefined,
  });
  await newSDKInstance.authenticate();

  return newSDKInstance;
};

export const getTokenExchangeSupportQueryKey = () => [
  BASE_QUERY_KEY,
  'tokenexchangesupport',
];

type TokenExchangeSupportResponse = {
  supported: boolean;
};

export const useTokenExchangeSupport = () => {
  const sdk = useSDK();

  return useQuery<TokenExchangeSupportResponse>(
    getTokenExchangeSupportQueryKey(),
    async () =>
      sdk
        .get<TokenExchangeSupportResponse>(
          `${getSessionsUrl({ project: getProject() })}/tokenexchangesupport`
        )
        .then((r) => r.data),
    {
      refetchOnWindowFocus: false,
    }
  );
};
