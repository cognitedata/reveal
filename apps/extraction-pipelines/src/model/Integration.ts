import { MetaData } from './MetaData';
import { User } from './User';

export interface Integration {
  name: string;
  createdTime: number;
  lastUpdatedTime: number;
  schedule?: string;
  dataSetId: string;
  externalId: string;
  description: string;
  metadata: MetaData;
  id: number;
  owner: User;
  authors: User[];
}
