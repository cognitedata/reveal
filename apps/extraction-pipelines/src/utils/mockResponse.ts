import { Integration } from '../model/Integration';

export const mockResponse: Integration[] = [
  {
    createdTime: 1584065700000,
    lastUpdatedTime: 1584137100000,
    externalId: 'dataIntegration0001',
    name: 'Azure Integration',
    description: 'Dummy integration to Azure',
    dataSetId: '1398950266713987',
    schedule: '0 0 9 1/1 * ? *',
    // schedule: '0 0 9 * *', //00:00 on day-of-month 9
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
      {
        email: 'lisa.halvorsen@item.no',
        name: 'Lisa Halvorsen',
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
    schedule: '0 0 12 1/1 * ? *',
    // schedule: '0 2 * * 1', // 02:00 every monday
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
    dataSetId: '1640958057260772',
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
    lastUpdatedTime: 1603459877000,
    externalId: 'dataIntegration0004',
    name: 'PI Time Series',
    description: 'Dummy PI time series',
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
];

export const mockDataSetResponse = () => [
  {
    id: parseInt(mockResponse[0].dataSetId, 10),
    name: 'My data set 1',
    createdTime: new Date(2020, 10, 10),
    writeProtected: true,
    lastUpdatedTime: new Date(2020, 11, 1),
  },
  {
    id: parseInt(mockResponse[1].dataSetId, 10),
    name: 'This other data set',
    createdTime: new Date(2020, 11, 1),
    writeProtected: true,
    lastUpdatedTime: new Date(2020, 11, 1),
  },
  {
    id: parseInt(mockResponse[2].dataSetId, 10),
    name: 'Third data set',
    createdTime: new Date(2020, 11, 1),
    writeProtected: true,
    lastUpdatedTime: new Date(2020, 11, 1),
  },
];

export const mockError = {
  error: { code: 400, message: 'Multiple authentication headers present' },
};

export const mockDataRunsResponse = [
  {
    timestamp: 1605575298134,
    status: 'Failure',
    statusSeen: 'Seen',
  },
  { timestamp: 1605418198134, status: '', statusSeen: 'Seen' },
  { timestamp: 1604918198134, status: 'Failure', statusSeen: 'Seen' },
  { timestamp: 1604218198134, status: 'Success', statusSeen: 'Seen' },
  { timestamp: 1603918198134, status: 'Success', statusSeen: 'Seen' },
  { timestamp: 1600923198134, status: 'Success', statusSeen: 'Seen' },
];
