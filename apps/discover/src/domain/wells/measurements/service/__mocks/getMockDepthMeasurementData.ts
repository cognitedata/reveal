import { getMockDepthMeasurementDataWellboreOne } from 'domain/wells/measurements/internal/__fixtures/measurements';

import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { DepthMeasurementData } from '@cognite/sdk-wells-v3/dist/src';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

export const SEQUENCE_DATA_URL = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/measurements/depth/data`;

export const getMockDepthMeasurementData = (
  delay?: number,
  customResponse?: Partial<DepthMeasurementData>
): MSWRequest => {
  return rest.post<{ sequenceExternalId: string }>(
    SEQUENCE_DATA_URL,
    (req, res, ctx) => {
      const { sequenceExternalId } = req.body;
      const source = {
        sequenceExternalId,
        sourceName: customResponse?.source?.sourceName
          ? customResponse.source.sourceName
          : 'BP-Pequin',
      };
      const response = customResponse
        ? {
            ...customResponse,
            source,
          }
        : getMockDepthMeasurementDataWellboreOne({
            source,
          });
      if (delay && delay > 0) {
        return res(ctx.delay(delay), ctx.json(response));
      }
      return res(ctx.json(response));
    }
  );
};
