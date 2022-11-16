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
  dataModelStorageMappingSource: {
    filter: {
      and: [
        {
          hasData: {
            models: [[string, string]];
          };
        }
      ];
    };
    properties: {
      from:
        | {
            property: [string, string, string];
          }
        | {
            connection: {
              edgeFilter: {
                hasData: {
                  dataContainer: [string, string];
                };
              };
            };
            outwards: boolean;
          };
      as?: string;
    }[];
  };
}
