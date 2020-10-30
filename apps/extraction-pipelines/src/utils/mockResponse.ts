export const mockResponse = [
  {
    createdTime: 1584065700000,
    lastUpdatedTime: 1584137100000,
    externalId: 'dataIntegration0001',
    name: 'Azure Integration',
    description: 'Dummy integration to Azure',
    dataSetId: 'DataSetExternalId10',
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
    dataSetId: 'DataSetExternalId11',
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
    dataSetId: 'DataSetExternalId12',
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
    dataSetId: 'DataSetExternalId13',
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
