// @ts-nocheck
import { Extpipe } from 'model/Extpipe';
import { DataSetModel } from 'model/DataSetModel';
import { RunApi } from 'model/Runs';
import { mapDataSetToExtpipe } from 'utils/dataSetUtils';
import moment from 'moment';

export const mockDataSetResponse = (): DataSetModel[] => [
  {
    id: getMockResponse()[0].dataSetId,
    name: 'My data set 1',
    createdTime: new Date(2020, 10, 10),
    writeProtected: true,
    lastUpdatedTime: new Date(2020, 11, 1),
  } as DataSetModel,
  {
    id: getMockResponse()[1].dataSetId,
    name: 'This other data set',
    createdTime: new Date(2020, 11, 1),
    writeProtected: true,
    lastUpdatedTime: new Date(2020, 11, 1),
  } as DataSetModel,
  {
    id: getMockResponse()[2].dataSetId,
    createdTime: new Date(1605349723208),
    description: 'This is a test data set',
    lastUpdatedTime: new Date(1605349802859),
    metadata: {
      consoleAdditionalDocs: [],
      consoleCreatedBy: { username: 'lisa.halvorsen@cognitedata.com' },
      consoleLabels: ['Test', 'Lisa', 'Itera'],
      consoleMetaDataVersion: '3',
      consoleOwners: [
        { name: 'Lisa Halvorsen', email: 'lisa.halvorsen@cognite.com' },
      ],
    },
    name: 'AkerBP extractor test',
    writeProtected: false,
  } as DataSetModel,
];

const mockResponseV2: { nextCursor: string; items: Extpipe[] } = {
  items: [
    {
      createdTime: 1601589600000,
      lastUpdatedTime: 1584137100000,
      externalId: 'dataExtpipe0001',
      name: 'Azure Extpipe',
      createdBy: 'test@test.no',
      description: 'Dummy extpipe to Azure',
      documentation: 'This is the new documentation field',
      source: 'My source system',
      dataSetId: 1398950266713987,
      rawTables: [
        {
          dbName: 'informatica',
          tableName: 'oracle',
        },
      ],
      lastSuccess: moment().subtract(1, 'hour').toDate().getTime(),
      lastFailure: moment().subtract(1, 'day').toDate().getTime(),
      lastSeen: moment().toDate().getTime(),
      lastMessage: 'This is a mock failed run error message',
      schedule: '0 0 9 1/1 * ? *',
      contacts: [
        {
          email: 'Jacek.Fijalkowski@itera.no',
          name: 'Jacek Fijalkowski',
        },
        {
          email: 'Katinka.Odner@itera.no',
          name: 'Katinka Odner',
          role: 'Designer',
          sendNotification: true,
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
      externalId: 'dataExtpipe0002',
      name: 'SAP Extpipe',
      description: 'Dummy extpipe to SAP',
      dataSetId: 1469810437954362,
      rawTables: [
        {
          dbName: 'informatica',
          tableName: 'oracle',
        },
      ],
      lastSuccess: moment().subtract(1, 'day').toDate().getTime(),
      lastFailure: moment().toDate().getTime(),
      lastSeen: moment().subtract(1, 'hour').toDate().getTime(),
      schedule: '0 0 12 1/1 * ? *',
      contacts: [
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
      externalId: 'dataExtpipe0003',
      name: 'PI AF extpipe',
      description: 'Dummy PI AF extpipe',
      source: 'This is the source',
      dataSetId: 1469810437954369,
      rawTables: [
        {
          dbName: 'informatica',
          tableName: 'oracle',
        },
      ],
      lastSuccess: 1584065800000,
      lastFailure: 1584066700000,
      lastSeen: 1604271600000,
      lastMessage:
        'This is a failed run. Error message with a longer text for detailed description of error',
      schedule: 'On trigger',
      contacts: [
        {
          email: 'Jacek.Fijalkowski@itera.no',
          name: 'Jacek Fijalkowski',
        },
        {
          email: 'hakon.tromborg@cognite.com',
          name: 'Håkon Trømborg',
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
      externalId: 'dataExtpipe0004',
      name: 'PI Time Series',
      description: 'Dummy PI time series',
      lastSuccess: 1584064700000,
      lastFailure: 1584065800000,
      lastSeen: 1584066900000,
      dataSetId: 1469810437954362,
      rawTables: [
        {
          dbName: 'informatica',
          tableName: 'oracle',
        },
      ],
      contacts: [
        {
          email: 'Birger.Urdahl@itera.no',
          role: 'Owner',
          name: 'Birger Urdahl',
        },
        {
          email: 'Jacek.Fijalkowski@itera.no',
          role: 'Mechanic',
          name: 'Jacek Fijalkowski',
        },
        {
          email: 'lisa.halvorsen@item.no',
          role: 'Technician',
          name: 'Lisa Halvorsen',
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
      externalId: 'dataExtpipe0004',
      name: 'Newly created extpipe',
      description: 'This extpipe is created but not run',
      lastSuccess: 0,
      lastFailure: 0,
      lastSeen: 0,
      dataSetId: 1469810437954362,
      rawTables: [
        {
          dbName: 'informatica',
          tableName: 'oracle',
        },
      ],
      contacts: [],
      metadata: {
        sourceSystem: 'PI',
      },
      id: 825964439209157,
    },
  ],
  nextCursor: '',
};

export const getMockResponse = (): Extpipe[] => {
  return mockResponseV2.items;
};
export const getMockExtpipesWithDataSets = () => {
  return mapDataSetToExtpipe(getMockResponse(), mockDataSetResponse());
};

export const mockError = {
  error: { code: 400, message: 'Multiple authentication headers present' },
};

export const unauthorizedError = {
  status: 403,
  data: {
    code: 403,
    message: 'Not authorized for this operation',
  },
};

export const mockDataRunsResponse: { items: RunApi[] } = {
  items: [
    {
      id: 1,
      createdTime: 1605575298134,
      status: 'failure',
      message: 'This is an error message',
    },
    {
      id: 2,
      createdTime: 1605555298134,
      status: 'success',
    },
    {
      id: 3,
      createdTime: 1605535298134,
      status: 'seen',
    },
    {
      id: 4,
      createdTime: 1605418198134,
      status: 'seen',
    },
    {
      id: 5,
      createdTime: 1604918198134,
      status: 'success',
    },
    {
      id: 6,
      createdTime: 1604218198134,
      status: 'success',
    },
    {
      id: 7,
      createdTime: 1603918198134,
      status: 'failure',
      message: 'This is an error message foo bar',
    },
    {
      id: 8,
      createdTime: 1600923198134,
      status: 'success',
    },
    {
      id: 8,
      createdTime: 1600923198134,
      status: 'success',
    },
    {
      id: 9,
      createdTime: 1600923198134,
      status: 'success',
    },
    {
      id: 10,
      createdTime: 1600923198134,
      status: 'success',
    },
    {
      id: 11,
      createdTime: 1600923198134,
      status: 'success',
    },
    {
      id: 12,
      createdTime: 1600923198134,
      status: 'success',
    },
  ],
};

export const mockDataRuns: { items: RunApi[] } = {
  items: [
    {
      id: 1,
      createdTime: new Date(2021, 5, 1, 8, 0).getTime(),
      status: 'failure',
      message: 'This is an error message',
    },
    {
      id: 2,
      createdTime: new Date(2021, 5, 1, 8, 10).getTime(),
      status: 'seen',
    },
    {
      id: 3,
      createdTime: new Date(2021, 5, 1, 8, 20).getTime(),
      status: 'seen',
    },
    {
      id: 4,
      createdTime: new Date(2021, 5, 2, 8, 0).getTime(),
      status: 'success',
    },
    {
      id: 5,
      createdTime: new Date(2021, 5, 2, 9, 0).getTime(),
      status: 'seen',
    },
    {
      id: 6,
      createdTime: new Date(2021, 5, 2, 10, 0).getTime(),
      status: 'success',
    },
    {
      id: 7,
      createdTime: new Date(2021, 5, 5, 8, 0).getTime(),
      status: 'failure',
      message: 'This is an error message foo bar',
    },
    {
      id: 8,
      createdTime: new Date(2021, 5, 5, 9, 0).getTime(),
      status: 'success',
    },
    {
      id: 9,
      createdTime: new Date(2021, 5, 5, 9, 50).getTime(),
      status: 'seen',
    },
    {
      id: 10,
      createdTime: new Date(2021, 5, 5, 10, 0).getTime(),
      status: 'success',
    },
    {
      id: 11,
      createdTime: new Date(2021, 5, 11, 7, 50).getTime(),
      status: 'seen',
    },
    {
      id: 12,
      createdTime: new Date(2021, 5, 11, 8, 0).getTime(),
      status: 'success',
    },
    {
      id: 13,
      createdTime: new Date(2021, 5, 11, 8, 50).getTime(),
      status: 'seen',
    },
    {
      id: 14,
      createdTime: new Date(2021, 5, 11, 9, 0).getTime(),
      status: 'success',
    },
    {
      id: 15,
      createdTime: new Date(2021, 5, 11, 9, 50).getTime(),
      status: 'seen',
    },
    {
      id: 16,
      createdTime: new Date(2021, 5, 11, 10, 0).getTime(),
      status: 'success',
    },
    {
      id: 17,
      createdTime: new Date(2021, 5, 11, 10, 50).getTime(),
      status: 'seen',
    },
    {
      id: 18,
      createdTime: new Date(2021, 5, 11, 11, 0).getTime(),
      status: 'success',
    },
  ],
};
export const datasetMockResponse = () => {
  return {
    items: [
      { id: 123, name: 'data set 1' },
      { id: 321, name: 'other name' },
      { id: 111, name: 'something data' },
      { id: 222, name: 'foo bar' },
    ],
  };
};

export const dbResponse = { items: [{ name: 'my_db' }, { name: 'foo' }] };
export const tableResponse = {
  items: [{ name: 'my_table' }, { name: 'foo_table' }],
};
export const table2Response = {
  items: [{ name: 'table_123' }, { name: 'table_321' }],
};
export const databaseListMock = [
  { database: dbResponse.items[0], tables: [...tableResponse.items] },
  { database: dbResponse.items[1], tables: [...table2Response.items] },
];
