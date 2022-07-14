/* DATA MODEL TYPES */
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
