import { CogniteClient, ClientOptions } from '@cognite/sdk';

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

  getTableRows(tableName: string) {
    return this.cogniteClient.raw.listRows(this.dbName, tableName);
  }
}

const DEFAULT_CONFIG: CdfClientOptions = {
  appId: 'digital-cockpit',
  dbName: 'digital-cockpit',
};

export function createClient(options: CdfClientOptions = DEFAULT_CONFIG) {
  return new CdfClient(options);
}
