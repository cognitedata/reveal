export type SchemaAPI = {
  externalId: string;
  name: string;
  description: string;

  versions: SchemaAPIVersion[];
};

export type SchemaAPIVersion = {
  version: string;
  apiExternalId: string;
  graphQl: string;
  bindings: Binding[];
};

export type Binding = {
  targetName: string;
  dataModelStorageSource: {
    space: string;
    externalId: string;
  };
};
