export interface CreateDataModelDTO {
  space?: string;
  name: string;
  externalId?: string;
  description?: string;
  graphQlDml?: string;
  owner?: string;
  metadata?: {
    [key: string]: string | number | boolean;
  };
}
