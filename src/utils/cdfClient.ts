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
  dataSetName: string;
};

type CdfClientOptions = ClientOptions & dcClientOptions;

export class CdfClient {
  readonly cogniteClient: CogniteClient;
  readonly dbName: string;
  readonly dataSetName: string;

  constructor(options: CdfClientOptions, client?: CogniteClient) {
    this.cogniteClient = client || new CogniteClient(options);
    this.dbName = options.dbName;
    this.dataSetName = options.dataSetName;
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
  deleteFiles(externalIds: CogniteExternalId[]) {
    return this.cogniteClient.files.delete(
      externalIds.map((id) => ({ externalId: id })) as IdEither[]
    );
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
  retrieveDataSet(externalId: CogniteExternalId) {
    return this.cogniteClient.datasets.retrieve([{ externalId }]);
  }
  createDataSet(externalId: CogniteExternalId, name?: string) {
    return this.cogniteClient.datasets.create([
      { externalId, name: name || this.dataSetName },
    ]);
  }
}

const DEFAULT_CONFIG: CdfClientOptions = {
  appId: 'digital-cockpit',
  dbName: 'digital-cockpit',
  dataSetName: 'digital-cockpit',
};

export function createClient(
  options: CdfClientOptions = DEFAULT_CONFIG,
  client?: CogniteClient
) {
  return new CdfClient(options, client);
}
