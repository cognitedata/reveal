import { Relationship } from '@cognite/sdk';

export const relationships: Relationship[] = [
  {
    externalId: 'A_B',
    sourceExternalId: 'LOR_SWEDEN',
    sourceType: 'asset',
    targetExternalId: 'LOR_GATHERING_POINT_D',
    targetType: 'asset',
    createdTime: new Date(2022, 7, 28),
    lastUpdatedTime: new Date(2022, 7, 28),
    labels: [
      {
        externalId: 'BEST_DAY_WELL_FLAG_GAS',
      },
      {
        externalId: 'BEST_DAY_NETWORK_LEVEL_WELL',
      },
      {
        externalId: 'BEST_DAY_ARTIFICIAL_LIFT_PUMP',
      },
    ],
  },

  {
    externalId: 'B_C',
    sourceExternalId: 'LOR_SWEDEN',
    sourceType: 'asset',
    targetExternalId: 'LOR_GATHERING_POINT_E',
    targetType: 'asset',
    createdTime: new Date(2022, 7, 28),
    lastUpdatedTime: new Date(2022, 7, 28),
    labels: [
      {
        externalId: 'flowsTo',
      },
    ],
  },
];
