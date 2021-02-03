import { DataSet } from '@cognite/sdk';

type ConsoleSource = { names?: string[] };

type ConsoleExtractors = { accounts?: string[] };

type RawTables = { databaseName: string; tableName: string }[];

type Transformations = { name?: string; type?: string; details?: string }[];

type ConsoleOwners = { name?: string; email?: string }[];

type ConsoleCreatedBy = { username?: string };

type ConsoleLabels = string[];

export type DataSetMetadata = {
  consoleCreatedBy?: ConsoleCreatedBy;
  consoleLabels?: ConsoleLabels;
  consoleMetaDataVersion?: string | number;
  consoleOwners?: ConsoleOwners;
  consoleAdditionalDocs?: unknown[];
  consoleSource?: ConsoleSource;
  consoleExtractors?: ConsoleExtractors;
  rawTables?: RawTables;
  transformations?: Transformations;
  consoleGoverned?: boolean;
  [k: string]: unknown;
};

export interface DataSetModel
  extends Pick<
    DataSet,
    | 'id'
    | 'name'
    | 'externalId'
    | 'createdTime'
    | 'lastUpdatedTime'
    | 'description'
    | 'writeProtected'
  > {
  metadata: DataSetMetadata;
}
