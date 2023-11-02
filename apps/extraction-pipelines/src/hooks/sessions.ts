import { useMutation } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { CogniteClient } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

export type CreateSessionVariables =
  | {
      clientId: string;
      clientSecret: string;
    }
  | {
      tokenExchange: true;
    };

type Session = {
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

export const useCreateSession = () => {
  const sdk = useSDK();

  return useMutation(async (variables: CreateSessionVariables) => {
    return sdk
      .post<{ items: Session[] }>(`/api/v1/projects/${getProject()}/sessions`, {
        data: {
          items: [variables],
        },
      })
      .then((r) => r.data.items[0]);
  });
};

export const revokeSessionId = async (
  sdk: CogniteClient,
  sessionId: number
) => {
  try {
    const result = await sdk.post<{ items: Session[] }>(
      `/api/v1/projects/${getProject()}/sessions/revoke`,
      {
        data: {
          items: [{ id: sessionId }],
        },
      }
    );
    return result.data.items[0];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error occurred while revoking session');
  }
};
