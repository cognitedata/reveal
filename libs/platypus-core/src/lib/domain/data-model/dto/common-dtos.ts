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
