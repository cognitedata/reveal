import { rest } from 'msw';

import { Asset } from '@cognite/sdk';

import { mockCogniteAssetList } from '../../../__test-utils/fixtures/assets';
import { SIDECAR } from '../../../constants/app';

export const getMockAssetsByIds = (customResponse?: { items: Asset[] }) => {
  const url = `${SIDECAR.cdfApiBaseUrl}/api/v1/projects/testProject/assets/byids`;
  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(customResponse || { items: mockCogniteAssetList }));
  });
};
