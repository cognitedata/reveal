import { getMockWellTop } from 'domain/wells/wellTops/service/__fixtures/getMockWellTop';

import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { WellTopItems, WellTops } from '@cognite/sdk-wells';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

export const getMockWellTopsById = (customData?: WellTops[]): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/welltops/list`;

  return rest.post<{ filter: { wellboreIds: { matchingId: string }[] } }>(
    url,
    (req, res, ctx) => {
      const items =
        customData ||
        req.body.filter.wellboreIds.map(({ matchingId }) => {
          return getMockWellTop({ wellboreMatchingId: matchingId });
        });
      const responseData: WellTopItems = {
        items,
        nextCursor: undefined,
      };
      return res(ctx.json(responseData));
    }
  );
};
