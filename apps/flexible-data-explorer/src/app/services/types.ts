// Type has a field with the same name, 'dataModel'. This can create ambiguity.
export type DataModel = {
  dataModel?: string; // is this 'dataModelName'? or just 'model'?
  space?: string;
  version?: string;
};

export type DataModelV2 = {
  externalId: string;
  space: string;
  version: string;
};

export type DataType = string;

export type Instance = {
  dataType?: string;
  instanceSpace?: string;
  externalId?: string;
};

export type DataModelListResponse = {
  space: string;
  externalId: string;
  version: string;
  name?: string;
  description?: string;
  createdTime?: string | number;
  lastUpdatedTime?: string | number;
};

export type DataModelByIdResponse = {
  graphQlDml: string;
  version: string;
  name: string;
  space: string;
  description: string;
};

export type SearchResponse = {
  items: any[];
};

export type SearchAggregateCountResponse = {
  items: [
    {
      count: {
        externalId: number;
      };
    }
  ];
};

export type IntrospectionResponse = {
  allFields: {
    fields: {
      name: string;
      type: {
        name: string;
        kind: 'scalar' | 'object';
        ofType: {
          name: string;
          kind: 'scalar' | 'object';
        };
      };
    }[];
  };
};

// ----

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

export type DataModelTypeDefsType = {
  name: string;
  description?: string;
  displayName?: string;
  interfaces?: string[];
  directives?: DirectiveProps[];
  fields: DataModelTypeDefsField[];
  location?: { line: number; column: number };
};
export type DataModelTypeDefs = {
  types: DataModelTypeDefsType[];
  directives?: DirectiveProps[];
};
