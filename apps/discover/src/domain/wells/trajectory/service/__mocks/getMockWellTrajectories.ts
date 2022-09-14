import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { Trajectory } from '@cognite/sdk-wells';

import { getMockTrajectory } from '__test-utils/fixtures/well/trajectory';
import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

export const getMockTrajectoriesList = (
  customData?: Trajectory[]
): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/trajectories/list`;

  return rest.post<{ filter: { wellboreIds: { matchingId: string }[] } }>(
    url,
    (req, res, ctx) => {
      const items =
        customData ||
        req.body.filter.wellboreIds.map(({ matchingId }) =>
          getMockTrajectory(matchingId)
        );

      return res(ctx.json({ items }));
    }
  );
};
