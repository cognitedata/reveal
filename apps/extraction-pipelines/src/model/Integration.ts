import { MetaData } from 'model/MetaData';
import { User } from 'model/User';
import { DataSetModel } from 'model/DataSetModel';

export interface IntegrationRawTable {
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
  skipNotificationInMinutes?: number;
  rawTables?: IntegrationRawTable[];
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
  rawTables?: IntegrationRawTable[];
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
