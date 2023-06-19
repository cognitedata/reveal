import { useMutation } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';

type CreateSessionVariables = {
  clientId: string;
  clientSecret: string;
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

  return useMutation(
    async ({ clientId, clientSecret }: CreateSessionVariables) => {
      return sdk
        .post<{ items: Session[] }>(
          `/api/v1/projects/${getProject()}/sessions`,
          {
            data: {
              items: [
                {
                  clientId,
                  clientSecret,
                },
              ],
            },
          }
        )
        .then((r) => r.data.items[0]);
    }
  );
};
