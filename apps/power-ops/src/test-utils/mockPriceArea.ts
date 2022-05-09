import { PriceAreaWithData } from 'types';

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
  mainScenarioExternalId: 'mainScenarioExternalId',
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
      sequenceRows: [],
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
          sequenceRows: [],
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
          sequenceRows: [],
        },
      ],
    },
  ],
};
