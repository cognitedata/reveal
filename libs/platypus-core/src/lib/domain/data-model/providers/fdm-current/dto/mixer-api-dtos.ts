import { DataModelTypeDefs, DataModelTypeDefsType } from '../../../types';

export interface ApiVersionDataModel {
  types: any[];
  graphqlRepresentation: string;
}

export type DataModelStorageBindingsPropertyOneToMany = {
  connection: {
    edgeFilter: {
      hasData: {
        models: [[string, string]];
      };
    };
    outwards: boolean;
  };
};

export type DataModelStorageBindingsPropertyOneToOne = {
  property: [string, string, string];
};
export interface DataModelStorageBindingsProperty {
  from:
    | DataModelStorageBindingsPropertyOneToOne
    | DataModelStorageBindingsPropertyOneToMany;
  as?: string;
}

export interface DataModelStorageBindingsDTO {
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
    properties: DataModelStorageBindingsProperty[];
  };
}

export interface ApiVersion {
  version: number;
  createdTime: string;
  dataModel: ApiVersionDataModel;
  bindings?: [DataModelStorageBindingsDTO];
}

export interface DataModelApiOutputDTO {
  externalId: string;
  name: string;
  description: string;
  createdTime: number;
  versions?: ApiVersion[];
}

export interface ApiVersionFromGraphQl {
  apiExternalId: string;
  bindings?: DataModelStorageBindingsDTO[];
  graphQl: string;
  metadata?: {
    [key: string]: unknown;
  };
  version?: number;
}

export interface BuildQueryDTO {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  limit: number;
  cursor: string;
  hasNextPage: boolean;
  filter?: QueryFilter;
}

export type QueryFilter =
  | {
      [filterName: string]: {
        eq: string | number;
      };
    }
  | { and: QueryFilter[] }
  | { or: QueryFilter[] };

export interface ApiSpecDTO {
  externalId: string;
  name: string;
  description: string;
  metadata?: {
    [key: string]: unknown;
  };
}
