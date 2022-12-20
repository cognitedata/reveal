import { rest } from 'msw';
import { MSWRequest } from 'utils/test';
import { BidProcessResultWithData, SOLVER_STATUS_TYPES } from 'types';
import sidecar from 'utils/sidecar';
import { PriceArea } from '@cognite/power-ops-api-types';

const mockColumnHeaders = ['hour', 1, 2, 3];

const mockDataRows = [
  ['0', -500.05, -0.87, -0.32],
  ['1', 103.21, -0.87, -0.32],
  ['2', 103.21, -0.87, -0.32],
  ['3', 103.21, -0.87, -0.32],
  ['4', 103.21, -0.87, -0.32],
  ['5', 103.21, -0.87, -0.32],
  ['6', 103.21, -0.87, -0.32],
  ['7', 103.21, -0.87, -0.32],
  ['8', 103.21, -0.87, -0.32],
  ['9', 103.21, -0.87, -0.32],
  ['10', 103.21, -0.87, -0.32],
  ['11', 103.21, -0.87, -0.32],
  ['12', 103.21, -0.87, -0.32],
  ['13', 103.21, -0.87, -0.32],
  ['14', 103.21, -0.87, -0.32],
  ['15', 103.21, -0.87, -0.32],
  ['16', 103.21, -0.87, -0.32],
  ['17', 103.21, -0.87, -0.32],
  ['18', 103.21, -0.87, -0.32],
  ['19', 103.21, -0.87, -0.32],
  ['20', 103.21, -0.87, -0.32],
  ['21', 103.21, -0.87, -0.32],
  ['22', 103.21, -0.87, -0.32],
  ['23', 103.21, -0.87, -0.32],
] as [string, ...number[]][];

export const mockPriceArea: PriceArea = {
  externalId: 'mock_price_area_NO1',
  name: 'Mock NO 1',
};

export const mockBidProcessResult: BidProcessResultWithData = {
  priceAreaExternalId: mockPriceArea.externalId,
  priceAreaName: mockPriceArea.name,
  plants: [
    {
      externalId: 'plant1_externalId',
      name: 'plant1',
      displayName: 'Plant1',
    },
    {
      externalId: 'plant2_externalId',
      name: 'plant2',
      displayName: 'Plant2',
    },
  ],
  startDate: new Date(),
  bidDate: new Date(),
  bidProcessExternalId: 'bidProcessExternalId',
  mainScenarioExternalId: 'scenario1_externalId',
  priceScenarios: [
    {
      name: 'Scenario 1',
      priceTsExternalId: 'scenario1_externalId',
      totalProduction: {
        shopProductionExternalIds: ['scenario1_shop_total_externalId'],
      },
      plantProduction: [
        {
          plantName: 'plant1',
          production: {
            shopProductionExternalIds: ['scenario1_shop_plant1_externalId'],
          },
        },
        {
          plantName: 'plant2',
          production: {
            shopProductionExternalIds: ['scenario1_shop_plant2_externalId'],
          },
        },
      ],
      objectives: [
        {
          watercourse: 'watercourse_1',
          shopProcessEventExternalId: 'POWEROPS_SHOP_RUN_1651153522578',
          sumPenalties: 12345.1234,
          majorPenalties: 23.45,
          minorPenalties: 56.78,
          solverStatus: SOLVER_STATUS_TYPES.INFEASIBLE,
          sequenceExternalId: 'POWEROPS_FUNCTION_CALL_1651153522578_YLJA(54)',
          sequenceId: 1234,
          limitPenalties: 42,
        },
      ],
    },
    {
      name: 'Scenario 2',
      priceTsExternalId: 'scenario2_externalId',
      totalProduction: {
        shopProductionExternalIds: ['scenario2_shop_total_externalId'],
      },
      plantProduction: [
        {
          plantName: 'plant1',
          production: {
            shopProductionExternalIds: ['scenario2_shop_plant1_externalId'],
          },
        },
        {
          plantName: 'plant2',
          production: {
            shopProductionExternalIds: ['scenario2_shop_plant2_externalId'],
          },
        },
      ],
      objectives: [
        {
          watercourse: 'watercourse_1',
          shopProcessEventExternalId: 'POWEROPS_SHOP_RUN_1651153522578',
          sumPenalties: 12345.1234,
          majorPenalties: 23.45,
          minorPenalties: 56.78,
          solverStatus: SOLVER_STATUS_TYPES.INFEASIBLE,
          sequenceExternalId: 'POWEROPS_FUNCTION_CALL_1651153522578_YLJA(54)',
          sequenceId: 1234,
          limitPenalties: 42,
        },
      ],
    },
  ],
  totalMatrix: {
    externalId: 'total_matrixes_externalId',
  },
  plantMatrixes: [
    {
      plantName: 'plant1',
      matrix: {
        externalId: 'plant1_externalId',
      },
    },
    {
      plantName: 'plant2',
      matrix: {
        externalId: 'plant2_externalId',
      },
    },
  ],
  totalMatrixWithData: {
    headerRow: mockColumnHeaders,
    dataRows: mockDataRows,
  },
  plantMatrixesWithData: [
    {
      plantName: 'plant1',
      matrixWithData: {
        headerRow: mockColumnHeaders,
        dataRows: mockDataRows,
      },
    },
    {
      plantName: 'plant2',
      matrixWithData: {
        headerRow: mockColumnHeaders,
        dataRows: mockDataRows,
      },
    },
  ],
  marketConfiguration: {
    timezone: 'Europe/Oslo',
    tick_size: '0.1',
  },
};

export const getMockBidProcessResult = (
  project: string | undefined
): MSWRequest => {
  const url = `${sidecar.powerOpsApiBaseUrl}/${project}/price-area/${mockBidProcessResult.priceAreaExternalId}/data`;

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(mockBidProcessResult));
  });
};
