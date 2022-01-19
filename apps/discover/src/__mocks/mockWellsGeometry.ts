import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { WellGeometryListResponse } from '@cognite/discover-api-types';

import { getMockPointGeo } from '__test-utils/fixtures/geometry';
import { MSWRequest } from '__test-utils/types';

import { SIDECAR } from '../constants/app';

const responseData: WellGeometryListResponse = {
  features: [
    { geometry: getMockPointGeo(), properties: { id: 'well-collection-1' } },
  ],
  type: 'GeometryCollection',
};

export const getMockWellsGeometry = (): MSWRequest => {
  const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/well/geometry`;

  //   console.log('STARTING MOCK', url);

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
