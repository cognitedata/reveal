import { rest } from 'msw';

import { UMSUserProfile } from '@cognite/user-management-service-types';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { getMockUmsUserProfile } from '../__fixtures/umsUsers';

const userMeUrl = `https://user-management-service.staging.${SIDECAR.cdfCluster}.cognite.ai/user/me`;

export const getMockUserMe = (
  preferences?: Partial<UMSUserProfile>
): MSWRequest => {
  return rest.get<Request>(userMeUrl, (_req, res, ctx) => {
    return res(ctx.json(getMockUmsUserProfile(preferences)));
  });
};
