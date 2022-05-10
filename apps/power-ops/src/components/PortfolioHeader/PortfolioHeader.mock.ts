import { CogniteEvent } from '@cognite/sdk';
import { rest } from 'msw';
import sidecar from 'utils/sidecar';
import { MSWRequest } from 'utils/test';

export const mockCreatedTime = new Date();

export const getMockCdfEvents = (): MSWRequest => {
  const url = `${sidecar.cdfApiBaseUrl}/api/v1/projects/test-project/events/byids`;

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          {
            id: 124,
            createdTime: mockCreatedTime,
          },
        ] as CogniteEvent[],
      })
    );
  });
};
