/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyValueMap, ValidationError } from '../../../boundaries/types';
import { CreateDataModelTransformationDTO } from '../dto';

export * from './data-model-type-defs-types';
export interface DataModel {
  id: string;
  name: string;
  description?: string;
  createdTime: number;
  updatedTime: number;
  owners: string[];
  version: string;
  graphQlDml: string;
  /** DMS v3 requires space externalId */
  space: string;
}

export enum DataModelVersionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface DataModelVersion {
  name?: string;
  description?: string;
  externalId: string;
  status: DataModelVersionStatus;
  version: string;
  /** GraphQL Schema String */
  schema: string;
  /**
   * When resource was created
   */
  createdTime?: number;
  /**
   * When resource was last updated
   */
  lastUpdatedTime?: number;
  /** DMS v3 requires space externalId */
  space: string;
  views: {
    externalId: string;
    version: string;
  }[];
}

export type BuiltInType = {
  name: string;
  dmsType?: string;
  fieldDirective?: boolean;
  type: 'SCALAR' | 'DIRECTIVE' | 'OBJECT' | 'ENUM' | 'INPUT';
  body?: string;
  tsType?: string;
};

export type PaginatedResponse = {
  pageInfo: { cursor: string; hasNextPage: boolean };
  items: CdfResourceInstance[];
};
export interface DataModelValidationError extends ValidationError {
  typeName?: string;
  fieldName?: string;
}

export type DataModelTransformation = CreateDataModelTransformationDTO & {
  id: number;
};

/* CdfResourceInstance represents a single row of published data */
export interface CdfResourceInstance extends KeyValueMap {
  externalId: string;
}
