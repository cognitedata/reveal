import { Integration } from '../model/Integration';

export const mockDataSetResponse = () => [
  {
    id: parseInt(getMockResponse()[0].dataSetId, 10),
    name: 'My data set 1',
    createdTime: new Date(2020, 10, 10),
    writeProtected: true,
    lastUpdatedTime: new Date(2020, 11, 1),
  },
  {
    id: parseInt(getMockResponse()[1].dataSetId, 10),
    name: 'This other data set',
    createdTime: new Date(2020, 11, 1),
    writeProtected: true,
    lastUpdatedTime: new Date(2020, 11, 1),
  },
  {
    id: parseInt(getMockResponse()[2].dataSetId, 10),
    name: 'Third data set',
    createdTime: new Date(2020, 11, 1),
    writeProtected: true,
    lastUpdatedTime: new Date(2020, 11, 1),
  },
];

const mockResponseV2 = {
  items: [
    {
      createdTime: 1584065700000,
      lastUpdatedTime: 1584137100000,
      externalId: 'dataIntegration0001',
      name: 'Azure Integration',
      description: 'Dummy integration to Azure',
      dataSetId: '1398950266713987',
      lastSuccess: 1584066700000,
      lastFailure: 1584065700000,
      lastSeen: 1584064700000,
      schedule: '0 0 9 1/1 * ? *',
      owner: {
        email: 'duncan.silvey@cognite.com',
        name: 'Duncan Silvey',
      },
      authors: [
        {
          email: 'Katinka.Odner@itera.no',
          name: 'Katinka Odner',
        },
        {
          email: 'Jacek.Fijalkowski@itera.no',
          name: 'Jacek Fijalkowski',
        },
      ],
      metadata: {
        sourceSystem: 'Azure',
      },
      id: 825964439209154,
    },
    {
      createdTime: 1584065700000,
      lastUpdatedTime: 1584137100000,
      externalId: 'dataIntegration0002',
      name: 'SAP Integration',
      description: 'Dummy integration to SAP',
      dataSetId: '1469810437954362',
      lastSuccess: 1584064700001,
      lastFailure: 1584065700002,
      lastSeen: 1584066700003,
      schedule: '0 0 12 1/1 * ? *',
      owner: {
        email: 'Katinka.Odner@itera.no',
        name: 'Katinka Odner',
      },
      authors: [
        {
          email: 'Christina.Lind@itera.no',
          name: 'Christina Lind',
        },
        {
          email: 'lisa.halvorsen@item.no',
          name: 'Lisa Halvorsen',
        },
      ],
      metadata: {
        sourceSystem: 'SAP',
      },
      id: 825964439209155,
    },
    {
      createdTime: 1584065700000,
      lastUpdatedTime: 1584137100000,
      externalId: 'dataIntegration0003',
      name: 'PI AF integration',
      description: 'Dummy PI AF integration',
      dataSetId: '1469810437954369',
      lastSuccess: 1584064700012,
      lastFailure: 1584066700013,
      lastSeen: 1584065700011,
      schedule: 'On Trigger',
      owner: {
        email: 'katrine.tjolsen@cognite.com',
        name: 'Katrine Tjølsen',
      },
      authors: [
        {
          email: 'hakon.tromborg@cognite.com',
          name: 'Håkon Trømborg',
        },
        {
          email: 'Jacek.Fijalkowski@itera.no',
          name: 'Jacek Fijalkowski',
        },
      ],
      metadata: {
        sourceSystem: 'PI',
      },
      id: 825964439209156,
    },
    {
      createdTime: 1584065700000,
      lastUpdatedTime: 1584137100000,
      externalId: 'dataIntegration0004',
      name: 'PI Time Series',
      description: 'Dummy PI time series',
      lastSuccess: 1584064700000,
      lastFailure: 1584065800000,
      lastSeen: 1584066900000,
      dataSetId: '1469810437954362',
      owner: {
        email: 'Birger.Urdahl@itera.no',
        name: 'Birger Urdahl',
      },
      authors: [
        {
          email: 'lisa.halvorsen@item.no',
          name: 'Lisa Halvorsen',
        },
        {
          email: 'Jacek.Fijalkowski@itera.no',
          name: 'Jacek Fijalkowski',
        },
      ],
      metadata: {
        sourceSystem: 'PI',
      },
      id: 825964439209157,
    },
    {
      createdTime: 1584065700000,
      lastUpdatedTime: 1584137100000,
      externalId: 'dataIntegration0004',
      name: 'Newly created integration',
      description: 'This integration is created but not run',
      lastSuccess: 0,
      lastFailure: 0,
      lastSeen: 0,
      dataSetId: '1469810437954362',
      owner: {
        email: 'test@test.no',
        name: 'Test Testsen',
      },
      authors: [],
      metadata: {
        sourceSystem: 'PI',
      },
      id: 825964439209157,
    },
  ],
  nextCursor: '',
};

export const getMockResponse = (): Integration[] => {
  return mockResponseV2.items;
};

export const mockError = {
  error: { code: 400, message: 'Multiple authentication headers present' },
};

export const mockDataRunsResponse = [
  {
    timestamp: 1605575298134,
    status: 'FAIL',
    statusSeen: 'OK',
    subRows: [
      { timestamp: 1605555298134, status: 'FAIL', statusSeen: 'OK' },
      { timestamp: 1605535298134, status: 'OK', statusSeen: 'OK' },
    ],
  },
  { timestamp: 1605418198134, status: '', statusSeen: 'OK' },
  { timestamp: 1604918198134, status: 'FAIL', statusSeen: 'OK' },
  { timestamp: 1604218198134, status: 'OK', statusSeen: 'OK' },
  { timestamp: 1603918198134, status: 'OK', statusSeen: 'OK' },
  { timestamp: 1600923198134, status: 'OK', statusSeen: 'OK' },
];
