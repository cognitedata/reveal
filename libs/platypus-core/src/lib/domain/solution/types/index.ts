/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyValueMap } from '@platypus-core/boundaries/types';

export interface Solution {
  id: string;
  name: string;
  description?: string;
  createdTime: number;
  updatedTime: number;
  owners: string[];
  version: string;
}

export enum SolutionSchemaStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface SolutionSchema {
  externalId: string;
  status: SolutionSchemaStatus;
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

export interface SolutionDataModelFieldType {
  name: string;
  list?: boolean;
  nonNull?: boolean;
}

export type SolutionDataModelFieldArgument = {
  name: string;
  description?: string;
  type: SolutionDataModelFieldType;
  defaultValue?: any;
  directives?: DirectiveProps[];
};

export type SolutionDataModelField = {
  name: string;
  description?: string;
  arguments?: SolutionDataModelFieldArgument[];
  type: SolutionDataModelFieldType;
  directives?: DirectiveProps[];
  nonNull?: boolean;
  list?: string;
};

export type SolutionDataModelType = {
  name: string;
  description?: string;
  interfaces?: string[];
  directives?: DirectiveProps[];
  fields: SolutionDataModelField[];
};
export type SolutionDataModel = {
  types: SolutionDataModelType[];
};

/* SOLUTION DATA MODEL TYPES */
