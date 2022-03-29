import { rest } from 'msw';

import { UMSUserProfile } from '@cognite/user-management-service-types';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const responseData = (
  preferences?: Partial<UMSUserProfile>
): UMSUserProfile => ({
  id: '1',
  displayName: 'John Doe',
  projects: [],
  createdTime: '1',
  lastUpdatedTime: '1',
  preferences: {
    hidden: false,
    measurement: 'meter',
  },
  ...preferences,
});

export const getMockUserMe = (
  preferences?: Partial<UMSUserProfile>
): MSWRequest => {
  return rest.get<Request>(
    `https://user-management-service.staging.${SIDECAR.cdfCluster}.cognite.ai/user/me`,
    (_req, res, ctx) => {
      return res(ctx.json(responseData(preferences)));
    }
  );
};
