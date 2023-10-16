export type UpdateDataModelDTO = {
  externalId: string;
  version?: string;
  space?: string;
  name: string;
  description?: string;
  graphQlDml?: string;
  owner?: string;
  metadata?: {
    [key: string]: string | number | boolean;
  };
};
