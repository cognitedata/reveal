import { PriceAreaWithData } from 'types';
import { rest } from 'msw';
import sidecar from 'utils/sidecar';
import { MSWRequest } from 'utils/test';

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
];

export const mockPriceArea: PriceAreaWithData = {
  externalId: 'mock_price_area_NO1',
  name: 'Mock NO 1',
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
  bidDate: new Date(),
  bidProcessExternalId: 'bidProcessExternalId',
  mainScenarioExternalId: 'scenario1_externalId',
  priceScenarios: [
    {
      name: 'Scenario 1',
      externalId: 'scenario1_externalId',
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
    },
    {
      name: 'Scenario 2',
      externalId: 'scenario2_externalId',
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
    },
  ],
  totalMatrix: {
    externalId: 'total_matrixes_externalId',
    startTime: 1651830168688,
  },
  plantMatrixes: [
    {
      plantName: 'plant1',
      matrix: {
        externalId: 'plant1_externalId',
        startTime: 1651830150988,
      },
    },
    {
      plantName: 'plant2',
      matrix: {
        externalId: 'plant2_externalId',
        startTime: 1651830151224,
      },
    },
  ],
  totalMatrixWithData: {
    externalId: 'total_matrixes_with_data_externalId',
    startTime: 1651830168688,
    columnHeaders: mockColumnHeaders,
    dataRows: mockDataRows,
  },
  plantMatrixesWithData: [
    {
      plantName: 'plant1',
      matrixWithData: {
        externalId: 'plant1_with_data_externalId',
        startTime: 1651830150988,
        columnHeaders: mockColumnHeaders,
        dataRows: mockDataRows,
      },
    },
    {
      plantName: 'plant2',
      matrixWithData: {
        externalId: 'plant2_with_data_externalId',
        startTime: 1651830151224,
        columnHeaders: mockColumnHeaders,
        dataRows: mockDataRows,
      },
    },
  ],
  marketConfiguration: {
    timezone: 'Europe/Oslo',
    tick_size: '0.1',
  },
};

export const getMockPriceArea = (project: string | undefined): MSWRequest => {
  const url = `${sidecar.powerOpsApiBaseUrl}/${project}/price-area/${mockPriceArea.externalId}/data`;

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(mockPriceArea));
  });
};
