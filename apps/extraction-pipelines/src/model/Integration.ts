import { DataSet } from '@cognite/sdk';
import { MetaData } from './MetaData';
import { User } from './User';

export interface Raw {
  dbName: string;
  tableName: string;
}

export interface Integration {
  name: string;
  createdTime: number; // milliseconds
  lastUpdatedTime: number; // milliseconds
  schedule?: string;
  dataSetId: string;
  dataSet?: DataSet;
  externalId: string;
  description: string;
  metadata: MetaData;
  id: number;
  contacts: User[];
  lastSuccess?: number; // milliseconds
  lastFailure?: number; // milliseconds
  lastSeen?: number; // milliseconds
  lastMessage?: string;
  rawTables?: Raw[];
}

export type IntegrationFieldName = keyof Integration | 'status' | 'latestRun';
export type IntegrationFieldValue =
  | Integration[keyof Integration]
  | moment.Moment
  | null;

export enum DetailFieldNames {
  EXTERNAL_ID = 'External id',
  DESCRIPTION = 'Description',
  CREATED_TIME = 'Created time',
  RAW_TABLE = 'Raw tables',
  META_DATA = 'Metadata',
  CONTACT = 'Contact',
}
