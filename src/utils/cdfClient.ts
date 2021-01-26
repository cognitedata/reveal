import {
  CogniteClient,
  ClientOptions,
  RawDBRowInsert,
  RawDBRowKey,
  ExternalFileInfo,
  IdEither,
  CogniteExternalId,
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

  insertTableRow(tableName: string, items: RawDBRowInsert[]) {
    return this.cogniteClient.raw.insertRows(this.dbName, tableName, items);
  }

  deleteTableRow(tableName: string, items: RawDBRowKey[]) {
    return this.cogniteClient.raw.deleteRows(this.dbName, tableName, items);
  }

  uploadFile(fileInfo: ExternalFileInfo) {
    return this.cogniteClient.files.upload(fileInfo, undefined, true);
  }
  retrieveFilesMetadata(externalIds: CogniteExternalId[]) {
    return this.cogniteClient.files.retrieve(
      externalIds.map((id) => ({ externalId: id })) as IdEither[]
    );
  }
  getDownloadUrls(externalIds: CogniteExternalId[]) {
    return this.cogniteClient.files.getDownloadUrls(
      externalIds.map((externalId) => ({
        externalId,
      }))
    );
  }
}

const DEFAULT_CONFIG: CdfClientOptions = {
  appId: 'digital-cockpit',
  dbName: 'digital-cockpit',
};

export function createClient(options: CdfClientOptions = DEFAULT_CONFIG) {
  return new CdfClient(options);
}
