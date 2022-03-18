import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const commonUrl = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/v1/projects/${TEST_PROJECT}/geospatial/featuretypes`;

export const getMockGeospatialFeatures = (
  featureTypeExternalId: string,
  customResponse?: any
): MSWRequest => {
  const url = `${commonUrl}/${featureTypeExternalId}/features`;

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(customResponse));
  });
};

export const getMockGeospatialFeatureTypes = (
  customResponse?: any
): MSWRequest => {
  return rest.post<Request>(commonUrl, (_req, res, ctx) => {
    return res(ctx.status(400), ctx.json(customResponse));
  });
};
