import {
  CogniteClient,
  ClientOptions,
  RawDBRowInsert,
  RawDBRowKey,
} from '@cognite/sdk';

type dcClientOptions = {
  dbName: string;
};

type CdfClientOptions = ClientOptions & dcClientOptions;

export class CdfClient {
  readonly cogniteClient: CogniteClient;
  readonly dbName: string;

  constructor(options: CdfClientOptions) {
    this.cogniteClient = new CogniteClient(options);
    this.dbName = options.dbName;
  }

  getUserGroups() {
    return this.cogniteClient.groups.list();
  }

  // TODO(DTC-194) to be removed after middleware deployed to staging
  getTableRows(tableName: string) {
    return this.cogniteClient.raw.listRows(this.dbName, tableName);
  }

  insertTableRow(tableName: string, items: RawDBRowInsert[]) {
    return this.cogniteClient.raw.insertRows(this.dbName, tableName, items);
  }

  deleteTableRow(tableName: string, items: RawDBRowKey[]) {
    return this.cogniteClient.raw.deleteRows(this.dbName, tableName, items);
  }
}

const DEFAULT_CONFIG: CdfClientOptions = {
  appId: 'digital-cockpit',
  dbName: 'digital-cockpit',
};

export function createClient(options: CdfClientOptions = DEFAULT_CONFIG) {
  return new CdfClient(options);
}
