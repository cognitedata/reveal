/* DATA MODEL TYPES */
export interface ArgumentNodeProps {
  name: string;
  value: any;
}

export interface DirectiveProps {
  name: string;
  arguments?: ArgumentNodeProps[];
}

type BultinFieldTypeNames =
  | 'Boolean'
  | 'DataPoint'
  | 'DataPointValue'
  | 'Float'
  | 'Int'
  | 'Int64'
  | 'JSONObject'
  | 'String'
  | 'TimeSeries'
  | 'Timestamp';

export interface DataModelTypeDefsFieldType {
  name: BultinFieldTypeNames | string;
  list?: boolean;
  nonNull?: boolean;
  custom?: boolean;
}

export type DataModelTypeDefsFieldArgument = {
  name: string;
  description?: string;
  type: DataModelTypeDefsFieldType;
  defaultValue?: any;
  directives?: DirectiveProps[];
};

export type DataModelTypeDefsField = {
  id?: string;
  name: string;
  description?: string;
  arguments?: DataModelTypeDefsFieldArgument[];
  type: DataModelTypeDefsFieldType;
  directives?: DirectiveProps[];
  nonNull?: boolean;
  list?: string;
  location?: { line: number; column: number };
};

export type DataModelTypeDefsType = {
  name: string;
  description?: string;
  interfaces?: string[];
  directives?: DirectiveProps[];
  fields: DataModelTypeDefsField[];
  location?: { line: number; column: number };
};
export type DataModelTypeDefs = {
  types: DataModelTypeDefsType[];
};
