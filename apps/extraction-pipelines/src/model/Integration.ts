import { MetaData } from './MetaData';
import { User } from './User';
import { DataSetModel } from './DataSetModel';

export interface Raw {
  dbName: string;
  tableName: string;
}

export interface RegisterIntegrationInfo {
  id?: number;
  name: string;
  externalId: string;
  schedule?: string;
  dataSetId: string;
  description?: string;
  metadata?: MetaData;
  contacts: User[];
  rawTables?: Raw[];
}
export interface Integration extends Omit<RegisterIntegrationInfo, 'id'> {
  id: number;
  createdTime: number; // milliseconds
  lastUpdatedTime: number; // milliseconds
  dataSet?: DataSetModel;
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
