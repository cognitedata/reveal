import { rest } from 'msw';

import { SIDECAR } from '../../../constants/app';
import { TEST_PROJECT } from '../../../setupTests';

export const getMockGeospatialFeatureTypesDelete = () => {
  const url = `${SIDECAR.cdfApiBaseUrl}/api/v1/projects/${TEST_PROJECT}/geospatial/featuretypes/delete`;

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json('ok'));
  });
};
