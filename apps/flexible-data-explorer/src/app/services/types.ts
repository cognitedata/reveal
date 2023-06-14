// Type has a field with the same name, 'dataModel'. This can create ambiguity.
export type DataModel = {
  dataModel?: string; // is this 'dataModelName'? or just 'model'?
  space?: string;
  version?: string;
};

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
  description: string;
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
