/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyValueMap } from '@platypus-core/boundaries/types';
export * from './data-model-storage-types';
export * from './data-model-type-defs-types';
export interface DataModel {
  id: string;
  name: string;
  description?: string;
  createdTime: number;
  updatedTime: number;
  owners: string[];
  version: string;
}

export enum DataModelVersionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface DataModelVersion {
  externalId: string;
  status: DataModelVersionStatus;
  version: string;
  /** GraphQL Schema String */
  schema: string;
  /**
   * When resource was created
   */
  createdTime: number;
  /**
   * When resource was last updated
   */
  lastUpdatedTime: number;
}

export type BuiltInType = {
  name: string;
  dmsType?: string;
  type: 'SCALAR' | 'DIRECTIVE' | 'OBJECT' | 'ENUM';
};

export type PaginatedResponse = {
  pageInfo: { cursor: string; hasNextPage: boolean };
  items: KeyValueMap[];
};
