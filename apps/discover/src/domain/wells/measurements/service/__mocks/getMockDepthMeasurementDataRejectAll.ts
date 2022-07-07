import { rest } from 'msw';

import { MSWRequest } from '__test-utils/types';

import { SEQUENCE_DATA_URL } from './getMockDepthMeasurementData';

export const getMockDepthMeasurementDataRejectAll = (): MSWRequest => {
  return rest.post<{ sequenceExternalId: string }>(
    SEQUENCE_DATA_URL,
    (req, res, ctx) => {
      return res(
        ctx.status(500),
        ctx.json({
          data: {
            error: {
              message: 'Some Error',
            },
          },
        })
      );
    }
  );
};
