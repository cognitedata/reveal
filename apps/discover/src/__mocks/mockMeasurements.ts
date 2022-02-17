import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import {
  getMockDepthMeasurementItem,
  getMockDepthMeasurementDataWellboreOne,
} from '__test-utils/fixtures/measurements';
import { MSWRequest } from '__test-utils/types';

import { SIDECAR } from '../constants/app';

export const getMockDepthMeasurements = (): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/measurements/depth/list`;

  return rest.post<{ filter: { wellboreIds: { matchingId: string }[] } }>(
    url,
    (req, res, ctx) => {
      const items = req.body.filter.wellboreIds.map(({ matchingId }) =>
        getMockDepthMeasurementItem(matchingId)
      );
      return res(ctx.json({ items }));
    }
  );
};

export const getMockDepthMeasurementData = (): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/measurements/depth/data`;

  return rest.post<{ filter: { sequenceExternalId: string } }>(
    url,
    (req, res, ctx) => {
      const { sequenceExternalId } = req.body.filter;
      const response = getMockDepthMeasurementDataWellboreOne({
        source: {
          sequenceExternalId,
          sourceName: 'BP-Pequin',
        },
      });
      return res(ctx.json(response));
    }
  );
};

export const getMockDepthMeasurementDataReject50Percent = (): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/measurements/depth/data`;

  return rest.post<{ filter: { sequenceExternalId: string } }>(
    url,
    (req, res, ctx) => {
      const rejectRequest = Math.random() < 0.5; // 50% this will be true, 30% false
      const { sequenceExternalId } = req.body.filter;
      const response = getMockDepthMeasurementDataWellboreOne({
        source: {
          sequenceExternalId,
          sourceName: 'BP-Pequin',
        },
      });
      return rejectRequest
        ? res(ctx.status(500), ctx.json({ error: 'Some error' }))
        : res(ctx.json(response));
    }
  );
};
