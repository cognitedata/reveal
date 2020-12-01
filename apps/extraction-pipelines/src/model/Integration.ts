import { DataSet } from '@cognite/sdk';
import { MetaData } from './MetaData';
import { User } from './User';

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
  owner: User;
  authors: User[];
  lastSuccess?: number; // milliseconds
  lastFailure?: number; // milliseconds
  lastSeen?: number; // milliseconds
}
