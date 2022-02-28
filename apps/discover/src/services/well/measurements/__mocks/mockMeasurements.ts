import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { DepthMeasurementData } from '@cognite/sdk-wells-v3/dist/src';

import {
  getMockDepthMeasurementItem,
  getMockDepthMeasurementDataWellboreOne,
} from '__test-utils/fixtures/measurements';
import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const SEQUENCE_URL = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/measurements/depth/list`;
const SEQUENCE_DATA_URL = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/measurements/depth/data`;

export const getMockDepthMeasurements = (
  delay?: number,
  customData?: DepthMeasurementData[]
): MSWRequest => {
  return rest.post<{ filter: { wellboreIds: { matchingId: string }[] } }>(
    SEQUENCE_URL,
    (req, res, ctx) => {
      const items =
        customData ||
        req.body.filter.wellboreIds.map(({ matchingId }) =>
          getMockDepthMeasurementItem(matchingId)
        );
      if (delay && delay > 0) {
        return res(ctx.delay(delay), ctx.json({ items }));
      }
      return res(ctx.json({ items }));
    }
  );
};

export const getMockDepthMeasurementData = (
  delay?: number,
  customData?: DepthMeasurementData
): MSWRequest => {
  return rest.post<{ sequenceExternalId: string }>(
    SEQUENCE_DATA_URL,
    (req, res, ctx) => {
      const { sequenceExternalId } = req.body;
      const response =
        customData ||
        getMockDepthMeasurementDataWellboreOne({
          source: {
            sequenceExternalId,
            sourceName: 'BP-Pequin',
          },
        });
      if (delay && delay > 0) {
        return res(ctx.delay(delay), ctx.json(response));
      }
      return res(ctx.json(response));
    }
  );
};

export const getMockDepthMeasurementDataReject50Percent = (): MSWRequest => {
  return rest.post<{ filter: { sequenceExternalId: string } }>(
    SEQUENCE_DATA_URL,
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
