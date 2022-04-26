import { rest } from 'msw';

import { SIDECAR } from '../../../constants/app';
import { TEST_PROJECT } from '../../../setupTests';
import { TEST_ERROR_MESSAGE } from '../constants';

export const getMockGeospatialFeature = () => {
  const url = `${SIDECAR.cdfApiBaseUrl}/api/v1/projects/${TEST_PROJECT}/geospatial/featuretypes/:featureType/features`;
  return rest.post(url, (req, res, ctx) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (req.body.items[0]?.externalId && req.body.items[0]?.geometry) {
      return res(ctx.json(req.body));
    }
    return res(ctx.json(new Error(TEST_ERROR_MESSAGE)), ctx.status(400));
  });
};
