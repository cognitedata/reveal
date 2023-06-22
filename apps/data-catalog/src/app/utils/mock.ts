import { DataSet } from './types';

export const mockDataSet: DataSet = {
  id: 123,
  externalId: `Some external Id`,
  name: `Some name`,
  description: `describes what this does`,
  writeProtected: false,
  createdTime: 1,
  lastUpdatedTime: 1,
  metadata: {
    archived: false,
    consoleLabels: ['First label', 'Second label'],
    consoleGoverned: true,
    consoleCreatedBy: { username: 'issaaf.kattan@cognite.com' },
    consoleOwners: [
      { name: 'issaaf.kattan', email: 'issaaf.kattan@cognite.com' },
    ],
    consoleMetaDataVersion: 3,
    consoleSource: {
      description: 'Some description of source',
      external: false,
    },
    consoleExtractors: {
      accounts: ['231213'],
    },
    rawTables: [{ databaseName: 'IAMDESIGNER', tableName: 'Information' }],
    consoleAdditionalDocs: [
      { type: 'link', id: 'hello.com', name: 'something' },
      { type: 'file', id: '213312123', name: 'docs.pdf' },
    ],
  },
};
