import { rest } from 'msw';

import { GEOMETRY, TEST_STRING } from '../../../__test-utils/fixtures/geometry';
import { SIDECAR } from '../../../constants/app';
import { TEST_PROJECT } from '../../../setupTests';

export const getMockGeospatialFeatureSearchStream = () => {
  const url = `${SIDECAR.cdfApiBaseUrl}/api/v1/projects/${TEST_PROJECT}/geospatial/featuretypes/:featureType/features/search-streaming`;

  return rest.post(url, (req, res, context) => {
    return res(
      context.body(
        `${JSON.stringify({
          geometry: GEOMETRY,
          Operator: TEST_STRING,
          createdTime: Date.now(),
          lastUpdatedTime: Date.now(),
          externalId: 'test',
        })}
        ${JSON.stringify({
          geometry: GEOMETRY,
          Operator: TEST_STRING,
          createdTime: Date.now(),
          lastUpdatedTime: Date.now(),
          externalId: 'test2',
        })}`
      )
    );
  });
};
