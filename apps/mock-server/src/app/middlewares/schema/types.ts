import { KeyValuePair, MockData } from '../../types';

export interface ApiVersion {
  version: number;
  dataModel: any;
  createdTime: number;
  bindings: any[];
  api?: Api;
}
export interface Api {
  externalId: string;
  name: string;
  description?: string;
  metadata: KeyValuePair;
  createdTime: number;
  versions: ApiVersion[];
  db?: MockData; // the template version tables and storage
}

export interface DmsBinding {
  targetName: string;
  dataModelStorageSource?: {
    externalId: string;
  };
}
