export interface FetchDataModelDTO {
  dataModelId: string;
}

export interface CreateDataModelDTO {
  name: string;
  externalId?: string;
  description?: string;
  owner?: string;
  metadata?: {
    [key: string]: string | number | boolean;
  };
}

export interface DeleteDataModelDTO {
  id: string;
}
