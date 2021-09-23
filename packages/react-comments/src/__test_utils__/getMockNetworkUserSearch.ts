import { UMSUser } from '@cognite/user-management-service-types';
import { RequestHandler, rest } from 'msw';

import { getMockUser } from './getMockUser';

type MSWRequest = RequestHandler<any, any, any, any>;

export const getMockNetworkUserSearch = (user?: Partial<UMSUser>): MSWRequest =>
  rest.post(`https://localhost/user/search`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json([getMockUser(user)]));
  });
