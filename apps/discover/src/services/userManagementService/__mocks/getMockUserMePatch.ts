import { rest } from 'msw';

import { UMSUserProfile } from '@cognite/user-management-service-types';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

export const responseData = (
  preferences?: Partial<UMSUserProfile['preferences']>
): UMSUserProfile => ({
  id: '1',
  displayName: 'John Doe',
  projects: [],
  createdTime: '1',
  lastUpdatedTime: '1',
  preferences: {
    hidden: false,
    measurement: 'meter',
    ...preferences,
  },
});

const userMeUrl = `https://user-management-service.staging.${SIDECAR.cdfCluster}.cognite.ai/user/me`;

export const getMockUserMePatch = (
  preferences?: Partial<UMSUserProfile['preferences']>
): MSWRequest => {
  return rest.patch<Request>(userMeUrl, (_req, res, ctx) => {
    return res(ctx.json(responseData(preferences)));
  });
};
