import {
  CogniteClient,
  ClientOptions,
  RawDBRowInsert,
  RawDBRowKey,
  RawDBRow,
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

  getAllUserGroups() {
    return this.cogniteClient.groups.list({ all: true });
  }

  insertTableRow(tableName: string, items: RawDBRowInsert[]) {
    return this.cogniteClient.raw.insertRows(this.dbName, tableName, items);
  }

  deleteTableRow(tableName: string, items: RawDBRowKey[]) {
    return this.cogniteClient.raw.deleteRows(this.dbName, tableName, items);
  }

  // TODO(DTC-222) temporary to fetch userSpace from cdf
  async getTableRow(tableName: string, key: string): Promise<RawDBRow> {
    return this.cogniteClient.raw.retrieveRow(this.dbName, tableName, key);
  }
}

const DEFAULT_CONFIG: CdfClientOptions = {
  appId: 'digital-cockpit',
  dbName: 'digital-cockpit',
};

export function createClient(options: CdfClientOptions = DEFAULT_CONFIG) {
  return new CdfClient(options);
}
