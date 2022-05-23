import { PriceAreaWithData, SequenceRow } from 'types';
import { rest } from 'msw';
import sidecar from 'utils/sidecar';
import { MSWRequest } from 'utils/test';
import { SequenceColumnBasicInfo } from '@cognite/sdk';

export const columns: SequenceColumnBasicInfo[] = [
  {
    externalId: 'price',
    valueType: 'DOUBLE',
    name: 'Price',
  },
  {
    externalId: '1h.1',
    valueType: 'DOUBLE',
    name: '1h.1',
  },
  {
    externalId: '1h.2',
    valueType: 'DOUBLE',
    name: '1h.2',
  },
  {
    externalId: '1h.3',
    valueType: 'DOUBLE',
    name: '1h.3',
  },
  {
    externalId: '1h.4',
    valueType: 'DOUBLE',
    name: '1h.4',
  },
  {
    externalId: '1h.5',
    valueType: 'DOUBLE',
    name: '1h.5',
  },
  {
    externalId: '1h.6',
    valueType: 'DOUBLE',
    name: '1h.6',
  },
  {
    externalId: '1h.7',
    valueType: 'DOUBLE',
    name: '1h.7',
  },
  {
    externalId: '1h.8',
    valueType: 'DOUBLE',
    name: '1h.8',
  },
  {
    externalId: '1h.9',
    valueType: 'DOUBLE',
    name: '1h.9',
  },
  {
    externalId: '1h.10',
    valueType: 'DOUBLE',
    name: '1h.10',
  },
  {
    externalId: '1h.11',
    valueType: 'DOUBLE',
    name: '1h.11',
  },
  {
    externalId: '1h.12',
    valueType: 'DOUBLE',
    name: '1h.12',
  },
  {
    externalId: '1h.13',
    valueType: 'DOUBLE',
    name: '1h.13',
  },
  {
    externalId: '1h.14',
    valueType: 'DOUBLE',
    name: '1h.14',
  },
  {
    externalId: '1h.15',
    valueType: 'DOUBLE',
    name: '1h.15',
  },
  {
    externalId: '1h.16',
    valueType: 'DOUBLE',
    name: '1h.16',
  },
  {
    externalId: '1h.17',
    valueType: 'DOUBLE',
    name: '1h.17',
  },
  {
    externalId: '1h.18',
    valueType: 'DOUBLE',
    name: '1h.18',
  },
  {
    externalId: '1h.19',
    valueType: 'DOUBLE',
    name: '1h.19',
  },
  {
    externalId: '1h.20',
    valueType: 'DOUBLE',
    name: '1h.20',
  },
  {
    externalId: '1h.21',
    valueType: 'DOUBLE',
    name: '1h.21',
  },
  {
    externalId: '1h.22',
    valueType: 'DOUBLE',
    name: '1h.22',
  },
  {
    externalId: '1h.23',
    valueType: 'DOUBLE',
    name: '1h.23',
  },
  {
    externalId: '1h.24',
    valueType: 'DOUBLE',
    name: '1h.24',
  },
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
      totalProduction: [
        {
          method: 'Method 1',
          shopProductionExternalId: 'scenario1_shop_total_externalId',
        },
      ],
      plantProduction: [
        {
          plantName: 'plant1',
          production: [
            {
              method: 'Method 1',
              shopProductionExternalId: 'scenario1_shop_plant1_externalId',
            },
          ],
        },
        {
          plantName: 'plant2',
          production: [
            {
              method: 'Method 1',
              shopProductionExternalId: 'scenario1_shop_plant2_externalId',
            },
          ],
        },
      ],
    },
    {
      name: 'Scenario 2',
      externalId: 'scenario2_externalId',
      totalProduction: [
        {
          method: 'Method 1',
          shopProductionExternalId: 'scenario2_shop_total_externalId',
        },
      ],
      plantProduction: [
        {
          plantName: 'plant1',
          production: [
            {
              method: 'Method 1',
              shopProductionExternalId: 'scenario2_shop_plant1_externalId',
            },
          ],
        },
        {
          plantName: 'plant2',
          production: [
            {
              method: 'Method 1',
              shopProductionExternalId: 'scenario2_shop_plant2_externalId',
            },
          ],
        },
      ],
    },
  ],
  totalMatrixes: [
    {
      method: 'Method 1',
      externalId: 'total_matrixes_externalId',
      startTime: 1651830168688,
    },
  ],
  plantMatrixes: [
    {
      plantName: 'plant1',
      matrixes: [
        {
          method: 'Method 1',
          externalId: 'plant1_externalId',
          startTime: 1651830150988,
        },
      ],
    },
    {
      plantName: 'plant2',
      matrixes: [
        {
          method: 'Method 1',
          externalId: 'plant2_externalId',
          startTime: 1651830151224,
        },
      ],
    },
  ],
  totalMatrixesWithData: [
    {
      method: 'Method 1',
      externalId: 'total_matrixes_with_data_externalId',
      startTime: 1651830168688,
      sequenceRows: [
        new SequenceRow(
          0,
          [
            -500, -0.87, -0.32, -0.32, -0.32, -0.32, -0.32, -24.32, -25.14,
            -24.87, -24.32, -24.32, -0.32, -0.32, -0.32, -0.32, -0.32, -0.32,
            -0.32, -22.39, -22.37, -22.35, -24.87, -24.87, -24.18,
          ],
          columns
        ),
        new SequenceRow(
          1,
          [
            103.21, -0.87, -0.32, -0.32, -0.32, -0.32, -0.32, -24.32, -25.14,
            -24.87, -24.32, -24.32, -0.32, -0.32, -0.32, -0.32, -0.32, -0.32,
            -0.32, -22.39, -22.37, -22.81, -24.87, -24.87, -24.18,
          ],
          columns
        ),
      ],
    },
  ],
  plantMatrixesWithData: [
    {
      plantName: 'plant1',
      matrixesWithData: [
        {
          method: 'Method 1',
          externalId: 'plant1_with_data_externalId',
          startTime: 1651830150988,
          sequenceRows: [
            new SequenceRow(
              0,
              [
                -500, -0.87, -0.32, -0.32, -0.32, -0.32, -0.32, -24.32, -25.14,
                -24.87, -24.32, -24.32, -0.32, -0.32, -0.32, -0.32, -0.32,
                -0.32, -0.32, -22.39, -22.37, -22.35, -24.87, -24.87, -24.18,
              ],
              columns
            ),
            new SequenceRow(
              1,
              [
                103.21, -0.87, -0.32, -0.32, -0.32, -0.32, -0.32, -24.32,
                -25.14, -24.87, -24.32, -24.32, -0.32, -0.32, -0.32, -0.32,
                -0.32, -0.32, -0.32, -22.39, -22.37, -22.81, -24.87, -24.87,
                -24.18,
              ],
              columns
            ),
          ],
        },
      ],
    },
    {
      plantName: 'plant2',
      matrixesWithData: [
        {
          method: 'Method 1',
          externalId: 'plant2_with_data_externalId',
          startTime: 1651830151224,
          sequenceRows: [
            new SequenceRow(
              0,
              [
                -500, -0.87, -0.32, -0.32, -0.32, -0.32, -0.32, -24.32, -25.14,
                -24.87, -24.32, -24.32, -0.32, -0.32, -0.32, -0.32, -0.32,
                -0.32, -0.32, -22.39, -22.37, -22.35, -24.87, -24.87, -24.18,
              ],
              columns
            ),
            new SequenceRow(
              1,
              [
                103.21, -0.87, -0.32, -0.32, -0.32, -0.32, -0.32, -24.32,
                -25.14, -24.87, -24.32, -24.32, -0.32, -0.32, -0.32, -0.32,
                -0.32, -0.32, -0.32, -22.39, -22.37, -22.81, -24.87, -24.87,
                -24.18,
              ],
              columns
            ),
          ],
        },
      ],
    },
  ],
};

export const getMockPriceArea = (project: string | undefined): MSWRequest => {
  const url = `${sidecar.powerOpsApiBaseUrl}/${project}/price-area-with-data/${mockPriceArea.externalId}`;

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(mockPriceArea));
  });
};
