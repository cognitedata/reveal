export interface FetchDataModelDTO {
  dataModelId: string;
  space: string;
}

export interface CreateDataModelDTO {
  space?: string;
  name: string;
  externalId?: string;
  description?: string;
  owner?: string;
  metadata?: {
    [key: string]: string | number | boolean;
  };
}
export interface UpdateDataModelDTO extends CreateDataModelDTO {
  externalId: string;
  version?: string;
}

export interface DeleteDataModelDTO {
  id: string;
}
