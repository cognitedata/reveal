export const assetsMockData = [
  {
    id: 2113091281838299,
    externalId: 'LOR_NORWAY',
    name: 'Norway',
    labels: [
      {
        externalId: 'MOCK_NETWORK_LEVEL_COUNTRY',
      },
    ],
    metadata: {
      model_id: 'VAL',
      'Network Level': 'Country',
    },
    dataSetId: 4525327311449925,
  },
  {
    id: 1024089787197873,
    parentExternalId: 'LOR_NORWAY',
    externalId: 'LOR_OSLO',
    name: 'Oslo',
    labels: [
      {
        externalId: 'MOCK_NETWORK_LEVEL_PRODUCTION_SYSTEM',
      },
    ],
    metadata: {
      'Network Level': 'Production System',
    },
    dataSetId: 4525327311449925,
  },
  {
    id: 4642328515242672,
    parentExternalId: 'LOR_OSLO',
    externalId: 'LOR_OSLO_WELL_01',
    name: 'Oslo well 01',
    labels: [
      {
        externalId: 'MOCK_NETWORK_LEVEL_WELL',
      },
      {
        externalId: 'MOCK_WELL_FLAG_GAS',
      },
      {
        externalId: 'MOCK_ARTIFICIAL_LIFT_PUMP',
      },
    ],
    metadata: {
      'Network Level': 'well',
    },
    dataSetId: 4525327311449925,
  },
  {
    id: 1813736367545799,
    parentExternalId: 'LOR_OSLO',
    externalId: 'LOR_OSLO_WELL_02',
    name: 'Oslo well 02',
    labels: [
      {
        externalId: 'MOCK_NETWORK_LEVEL_WELL',
      },
      {
        externalId: 'MOCK_WELL_FLAG_GAS',
      },
      {
        externalId: 'MOCK_ARTIFICIAL_LIFT_PUMP',
      },
    ],
    metadata: {
      'Network Level': 'well',
    },
    dataSetId: 4525327311449925,
  },
];
