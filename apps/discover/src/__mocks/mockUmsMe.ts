import { RequestHandler, rest } from 'msw';

import { UMSUser } from '@cognite/user-management-service-types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MSWRequest = RequestHandler<any, any, any, any>;

const responseData: UMSUser = {
  id: '1',
  displayName: 'John Doe',
  projects: [],
  createdTime: '1',
  lastUpdatedTime: '1',
};

export const getMockUserMe = (): MSWRequest => {
  return rest.get<Request>(
    `https://user-management-service.staging.bluefield.cognite.ai/user/me`,
    (_req, res, ctx) => {
      return res(ctx.json(responseData));
    }
  );
};
