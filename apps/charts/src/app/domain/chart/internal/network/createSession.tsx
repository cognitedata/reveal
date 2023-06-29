import { CogniteClient } from '@cognite/sdk';

import { SessionAPIPayload, SessionAPIResponse } from '../types';

export const createSession = (payload: SessionAPIPayload, sdk: CogniteClient) =>
  sdk.post<SessionAPIResponse>(`api/v1/projects/${sdk.project}/sessions`, {
    data: payload,
  });
