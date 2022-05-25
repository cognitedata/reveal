/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyValueMap } from '@platypus-core/boundaries/types';

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

/* SOLUTION DATA MODEL TYPES */
export interface ArgumentNodeProps {
  name: string;
  value: any;
}

export interface DirectiveProps {
  name: string;
  arguments?: ArgumentNodeProps[];
}

export interface DataModelTypeDefsFieldType {
  name: string;
  list?: boolean;
  nonNull?: boolean;
}

export type DataModelTypeDefsFieldArgument = {
  name: string;
  description?: string;
  type: DataModelTypeDefsFieldType;
  defaultValue?: any;
  directives?: DirectiveProps[];
};

export type DataModelTypeDefsField = {
  name: string;
  description?: string;
  arguments?: DataModelTypeDefsFieldArgument[];
  type: DataModelTypeDefsFieldType;
  directives?: DirectiveProps[];
  nonNull?: boolean;
  list?: string;
};

export type DataModelTypeDefsType = {
  name: string;
  description?: string;
  interfaces?: string[];
  directives?: DirectiveProps[];
  fields: DataModelTypeDefsField[];
};
export type DataModelTypeDefs = {
  types: DataModelTypeDefsType[];
};

export type BuiltInType = {
  name: string;
  type: 'SCALAR' | 'DIRECTIVE' | 'OBJECT' | 'ENUM';
};

export type PaginatedResponse = {
  pageInfo: { cursor: string; hasNextPage: boolean };
  items: KeyValueMap[];
};
