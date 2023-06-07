import { getProject } from '@cognite/cdf-utilities';
import { CogniteClient } from '@cognite/sdk';

export type Session = {
  id: number;
  type: 'CLIENT_CREDENTIALS' | 'TOKEN_EXCHANGE';
  status:
    | 'READY'
    | 'ACTIVE'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'REVOKED'
    | 'ACCESS_LOST';
  clientId?: string;
  nonce: string;
};

export const createSession = (sdk: CogniteClient) => {
  return sdk
    .post<{ items: Session[] }>(`/api/v1/projects/${getProject()}/sessions`, {
      data: {
        items: [
          {
            tokenExchange: true,
          },
        ],
      },
    })
    .then((r) => r.data.items[0]);
};
