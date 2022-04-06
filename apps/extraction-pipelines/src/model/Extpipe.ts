import { MetaData } from 'model/MetaData';
import { User } from 'model/User';
import { DataSetModel } from 'model/DataSetModel';

export interface ExtpipeRawTable {
  dbName: string;
  tableName: string;
}

export interface RegisterExtpipeInfo {
  id?: number;
  name: string;
  externalId: string;
  schedule?: string;
  dataSetId: number;
  description?: string;
  documentation?: string;
  source?: string;
  metadata?: MetaData;
  contacts?: User[];
  rawTables?: ExtpipeRawTable[];
  createdBy?: string;
}
export type NotificationConfig = {
  allowedNotSeenRangeInMinutes?: number;
};
export interface Extpipe extends Omit<RegisterExtpipeInfo, 'id'> {
  id: number;
  createdTime: number; // milliseconds
  createdBy?: string; // milliseconds
  lastUpdatedTime: number; // milliseconds
  dataSet?: DataSetModel;
  notificationConfig?: NotificationConfig;
  lastSuccess?: number; // milliseconds
  lastFailure?: number; // milliseconds
  lastSeen?: number; // milliseconds
  lastMessage?: string;
  rawTables?: ExtpipeRawTable[];
}

export type ExtpipeFieldName =
  | keyof Extpipe
  | 'status'
  | 'latestRun'
  | keyof MetaData;
export type ExtpipeFieldValue =
  | Extpipe[keyof Extpipe]
  | MetaData
  | moment.Moment
  | null;

export enum DetailFieldNames {
  EXTERNAL_ID = 'External id',
  ID = 'Extpipe id',
  DESCRIPTION = 'Description',
  CREATED_TIME = 'Created time',
  LAST_UPDATED_TIME = 'Last updated time',
  CREATED_BY = 'Created by',
  SOURCE = 'Source',
  STATE = 'State',
  DOCUMENTATION = 'Documentation',
  RAW_TABLE = 'RAW tables',
  META_DATA = 'Metadata',
  CONTACT = 'Contact',
  OWNER = 'Owner',
}
