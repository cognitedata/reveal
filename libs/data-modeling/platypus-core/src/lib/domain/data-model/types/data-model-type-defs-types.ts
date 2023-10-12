/* DATA MODEL TYPES */
export interface ArgumentNodeProps {
  name: string;
  value: any;
  kind?: 'type' | 'field' | 'version' | 'space' | 'relationRef' | 'direction';
}

export interface DirectiveProps {
  name: string;
  arguments?: ArgumentNodeProps[];
}

export type BultinFieldTypeNames =
  | 'Boolean'
  | 'DataPoint'
  | 'DataPointValue'
  | 'File'
  | 'Float'
  | 'Float32'
  | 'Float64'
  | 'Int'
  | 'Int32'
  | 'Int64'
  | 'JSONObject'
  | 'Sequence'
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

export type DataModelTypeDefsTypeKind = 'type' | 'interface';
export type DataModelTypeDefsType = {
  name: string;
  description?: string;
  interfaces?: string[];
  directives?: DirectiveProps[];
  fields: DataModelTypeDefsField[];
  version?: string;
  kind?: DataModelTypeDefsTypeKind;
  isReadOnly?: boolean;
  location?: { line: number; column: number };
};
export type DataModelTypeDefs = {
  types: DataModelTypeDefsType[];
  directives?: DirectiveProps[];
};
