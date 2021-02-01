import { DataSet } from '@cognite/sdk';
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
      createdTime: 1601589600000,
      lastUpdatedTime: 1584137100000,
      externalId: 'dataIntegration0001',
      name: 'Azure Integration',
      description: 'Dummy integration to Azure',
      dataSetId: '1398950266713987',
      rawTables: [
        {
          dbName: 'informatica',
          tableName: 'oracle',
        },
      ],
      dataSet: {
        name: 'Test data set',
        id: 1398950266713987,
      } as DataSet,
      lastSuccess: 1584066700000,
      lastFailure: 1584065700000,
      lastSeen: 1604271600000,
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
      externalId: 'dataIntegration0002',
      name: 'SAP Integration',
      description: 'Dummy integration to SAP',
      dataSetId: '1469810437954362',
      dataSet: {
        createdTime: new Date(1605349723208),
        description: 'This is a test data set',
        id: 6415110216649677,
        lastUpdatedTime: new Date(1605349802859),
        metadata: {
          consoleAdditionalDocs: '[]',
          consoleCreatedBy: "{ username: 'lisa.halvorsen@cognitedata.com' }",
          consoleLabels: "['Test', 'Lisa', 'Itera']",
          consoleMetaDataVersion: '3',
          consoleOwners:
            "[ { name: 'Lisa Halvorsen', email: 'lisa.halvorsen@cognite.com' }, ]",
        },
        name: 'AkerBP extractor test',
        writeProtected: false,
      },
      rawTables: [
        {
          dbName: 'informatica',
          tableName: 'oracle',
        },
      ],
      lastSuccess: 1584064700001,
      lastFailure: 1584065700002,
      lastSeen: 1584066700003,
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
      externalId: 'dataIntegration0003',
      name: 'PI AF integration',
      description: 'Dummy PI AF integration',
      dataSetId: '1469810437954369',
      dataSet: {
        createdTime: new Date(1605349723208),
        description: 'This is a test data set',
        id: 6415110216649677,
        lastUpdatedTime: new Date(1605349802859),
        metadata: {
          consoleAdditionalDocs: '[]',
          consoleCreatedBy: "{ username: 'lisa.halvorsen@cognitedata.com' }",
          consoleLabels: "['Test', 'Lisa', 'Itera']",
          consoleMetaDataVersion: '3',
          consoleOwners:
            "[ { name: 'Lisa Halvorsen', email: 'lisa.halvorsen@cognite.com' }, ]",
        },
        name: 'Lisas test data set',
        writeProtected: false,
      },
      rawTables: [
        {
          dbName: 'informatica',
          tableName: 'oracle',
        },
      ],
      lastSuccess: 1584064700012,
      lastFailure: 1584066700013,
      lastSeen: 1584065700011,
      schedule: 'On Trigger',
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
      externalId: 'dataIntegration0004',
      name: 'PI Time Series',
      description: 'Dummy PI time series',
      lastSuccess: 1584064700000,
      lastFailure: 1584065800000,
      lastSeen: 1584066900000,
      dataSetId: '1469810437954362',
      dataSet: {
        createdTime: new Date(1605349723208),
        description: 'This is a test data set',
        id: 6415110216649677,
        lastUpdatedTime: new Date(1605349802859),
        metadata: {
          consoleAdditionalDocs: '[]',
          consoleCreatedBy: "{ username: 'lisa.halvorsen@cognitedata.com' }",
          consoleLabels: "['Test', 'Lisa', 'Itera']",
          consoleMetaDataVersion: '3',
          consoleOwners:
            "[ { name: 'Lisa Halvorsen', email: 'lisa.halvorsen@cognite.com' }, ]",
        },
        name: 'Lisas test data set',
        writeProtected: false,
      },
      rawTables: [
        {
          dbName: 'informatica',
          tableName: 'oracle',
        },
      ],
      contacts: [
        {
          email: 'Birger.Urdahl@itera.no',
          name: 'Birger Urdahl',
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
      dataSet: {
        createdTime: new Date(1605349723208),
        description: 'This is a test data set',
        id: 6415110216649677,
        lastUpdatedTime: new Date(1605349802859),
        metadata: {
          consoleAdditionalDocs: '[]',
          consoleCreatedBy: "{ username: 'lisa.halvorsen@cognitedata.com' }",
          consoleLabels: "['Test', 'Lisa', 'Itera']",
          consoleMetaDataVersion: '3',
          consoleOwners:
            "[ { name: 'Lisa Halvorsen', email: 'lisa.halvorsen@cognite.com' }, ]",
        },
        name: 'Lisas test data set',
        writeProtected: false,
      },
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

export const getMockResponse = (): Integration[] => {
  return mockResponseV2.items;
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

export const mockDataRunsResponse = {
  items: [
    {
      createdTime: 1584065700000,
      lastUpdatedTime: 1584137100000,
      externalId: 'dataIntegration0001',
      statuses: [
        {
          createdTime: 1605575298134,
          status: 'failure',
        },
        {
          createdTime: 1605555298134,
          status: 'seen',
        },
        {
          createdTime: 1605535298134,
          status: 'seen',
        },
        {
          createdTime: 1605418198134,
          status: 'success',
        },
        {
          createdTime: 1604918198134,
          status: 'success',
        },
        {
          createdTime: 1604218198134,
          status: 'success',
        },
        {
          createdTime: 1603918198134,
          status: 'failure',
        },
        {
          createdTime: 1600923198134,
          status: 'success',
        },
      ],
    },
  ],
};
