import { DataModelTypeDefs, DataModelTypeDefsType } from '../types';

export interface GraphQlQueryParams {
  query: string;
  operationName?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: any;
}
export interface RunQueryDTO {
  graphQlParams: GraphQlQueryParams;
  /** dataModelId (template group external id) */
  dataModelId: string;
  schemaVersion: string;
  space?: string;
  extras?: {
    [key: string]: unknown;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GraphQLQueryResponse = { data?: any; errors?: Array<any> };

export interface ValidateDataModelBreakingChangeInfoDTO {
  currentValue: string;
  fieldName: string;
  previousValue: string;
  typeName: string;
  typeOfChange: string;
}

export interface ValidateDataModelDTO {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: {
    classification?: string;
    breakingChangeInfo?: ValidateDataModelBreakingChangeInfoDTO;
  };
  breakingChangeInfo?: ValidateDataModelBreakingChangeInfoDTO;
}

export type FieldFilter = {
  [filterName: string]: {
    eq?: string | number;
    isNull?: boolean;
    in?: string[] | number[];
    gt?: number;
    lt?: number;
    gte?: number;
    lte?: number;
    prefix?: string;
  };
};

export type QueryFilter =
  | FieldFilter
  | { and: QueryFilter[] }
  | { or: QueryFilter[] };

export type QuerySort = {
  fieldName: string;
  sortType: 'ASC' | 'DESC';
};

export interface BuildListQueryDTO {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  nestedLimit: number;
  limit: number;
  cursor: string;
  sort?: QuerySort;
  filter?: QueryFilter | { [key in string]: QueryFilter } | null;
  limitFields?: string[];
}

export interface BuildGetByExternalIdQueryDTO {
  spaceId: string;
  externalId: string;
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  nestedLimit: number;
  nestedCursors?: { [key in string]: string };
  nestedFilters?: { [key in string]: QueryFilter };
  limitFields?: string[];
}

export interface BuildSearchQueryDTO {
  dataModelType: DataModelTypeDefsType;
  dataModelTypeDefs: DataModelTypeDefs;
  limitFields?: string[];
  filter?: QueryFilter;
}
