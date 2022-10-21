import { BidProcessConfiguration } from '@cognite/power-ops-api-types';
import { CogniteEvent } from '@cognite/sdk';
import { rest } from 'msw';
import sidecar from 'utils/sidecar';
import { MSWRequest } from 'utils/test';

export const mockCreatedTime = new Date();

export const mockProcessConfigurations: BidProcessConfiguration[] = [
  {
    bidProcessEventExternalId:
      'POWEROPS_DAY_AHEAD_BID_MATRIX_CALCULATION_bb9fc5c7-3113-4547-b650-8c919fddf0f7',
    bidProcessConfiguration: 'multi_scenario',
    bidProcessFinishedDate: new Date(),
  },
  {
    bidProcessEventExternalId:
      'POWEROPS_DAY_AHEAD_BID_MATRIX_CALCULATION_d262bcf1-11f6-40d7-9aba-2c23e6677139',
    bidProcessConfiguration: 'price_independent',
    bidProcessFinishedDate: new Date(),
  },
];

export const getMockCdfEvents = (): MSWRequest => {
  const url = `${sidecar.cdfApiBaseUrl}/api/v1/projects/test-project/events/byids`;

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          {
            id: 124,
            createdTime: mockCreatedTime,
          },
        ] as CogniteEvent[],
      })
    );
  });
};
