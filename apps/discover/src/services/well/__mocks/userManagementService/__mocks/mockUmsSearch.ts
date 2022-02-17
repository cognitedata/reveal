import { rest } from 'msw';

import { UMSUser } from '@cognite/user-management-service-types';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const responseData: UMSUser[] = [
  {
    id: '1',
    displayName: 'John Doe',
    projects: [],
    createdTime: '1',
    lastUpdatedTime: '1',
  },
];

export const getMockUserSearch = (): MSWRequest => {
  return rest.post<Request>(
    `https://user-management-service.staging.${SIDECAR.cdfCluster}.cognite.ai/user/search`,
    (_req, res, ctx) => {
      return res(ctx.json(responseData));
    }
  );
};
