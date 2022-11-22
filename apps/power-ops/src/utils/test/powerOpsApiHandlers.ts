import { rest } from 'msw';
import sidecar from 'utils/sidecar';
import { bidMatrixresponse } from 'utils/test/power-ops-api/bidMatrixResponse';
import { priceAreasResponse } from 'utils/test/power-ops-api/price-areas';

interface RequestDefinition {
  method: keyof typeof rest;
  /** path without project */
  path: RegExp | string;
  response: any;
}

const requests: RequestDefinition[] = [
  {
    method: 'get',
    path: '/price-areas',
    response: priceAreasResponse,
  },
  {
    method: 'get',
    path: '/price-area/price_area_NO2/data/total_bidmatrix_externalid',
    response: bidMatrixresponse,
  },
  {
    method: 'get',
    path: '/sequence/bid-matrix',
    response: bidMatrixresponse,
  },
];

const projects = ['/test', '/test-loading', '/test-error'] as const;

export const powerOpsApiHandlers = requests.flatMap((request) =>
  projects.map((project) =>
    rest[request.method](
      sidecar.powerOpsApiBaseUrl + project + request.path,
      (_, res, ctx) => {
        switch (project) {
          case '/test':
            return res(ctx.json(request.response));
          case '/test-loading':
            return res(ctx.delay('infinite'));
          case '/test-error':
            return res(ctx.status(503), ctx.json({}));
          default:
            throw new Error('Project not found');
        }
      }
    )
  )
);
