import { getMockDepthMeasurementItem } from 'domain/wells/measurements/internal/__fixtures/measurements';

import isEmpty from 'lodash/isEmpty';
import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { DepthMeasurement } from '@cognite/sdk-wells-v3/dist/src';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

export const SEQUENCE_URL = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/measurements/depth/list`;

export const getMockDepthMeasurements = (
  delay?: number,
  customResponse?: DepthMeasurement[]
): MSWRequest => {
  return rest.post<{ filter: { wellboreIds: { matchingId: string }[] } }>(
    SEQUENCE_URL,
    (req, res, ctx) => {
      if (
        customResponse &&
        customResponse.length > 0 &&
        customResponse.length !== req.body.filter.wellboreIds.length
      ) {
        console.warn(
          'Need to provide same number of depth measurements as number of wellbores'
        );
        throw new Error(
          'Need to provide same number of depth measurements as number of wellbores'
        );
      }
      let items;
      if (!customResponse) {
        items = req.body.filter.wellboreIds.map(({ matchingId }) =>
          getMockDepthMeasurementItem(matchingId)
        );
      } else {
        items = !isEmpty(customResponse)
          ? req.body.filter.wellboreIds.map(({ matchingId }, index) => {
              return {
                ...customResponse[index],
                wellboreMatchingId: matchingId,
              };
            })
          : [];
      }
      if (delay && delay > 0) {
        return res(ctx.delay(delay), ctx.json({ items }));
      }
      return res(ctx.json({ items }));
    }
  );
};
