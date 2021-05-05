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
  dataSetId: number;
  description?: string;
  source?: string;
  metadata?: MetaData;
  contacts: User[];
  skipNotificationsInMinutes?: number;
  rawTables?: IntegrationRawTable[];
}
export interface Integration extends Omit<RegisterIntegrationInfo, 'id'> {
  id: number;
  createdTime: number; // milliseconds
  createdBy?: string; // milliseconds
  lastUpdatedTime: number; // milliseconds
  dataSet?: DataSetModel;
  lastSuccess?: number; // milliseconds
  lastFailure?: number; // milliseconds
  lastSeen?: number; // milliseconds
  lastMessage?: string;
  rawTables?: IntegrationRawTable[];
}

export type IntegrationFieldName =
  | keyof Integration
  | 'status'
  | 'latestRun'
  | keyof MetaData;
export type IntegrationFieldValue =
  | Integration[keyof Integration]
  | MetaData
  | moment.Moment
  | null;

export enum DetailFieldNames {
  EXTERNAL_ID = 'External id',
  ID = 'Integration id',
  DESCRIPTION = 'Description',
  CREATED_TIME = 'Created time',
  LAST_UPDATED_TIME = 'Last updated time',
  CREATED_BY = 'Created by',
  SOURCE = 'Source',
  STATE = 'State',
  RAW_TABLE = 'Raw tables',
  META_DATA = 'Metadata',
  CONTACT = 'Contact',
  OWNER = 'Owner',
}
