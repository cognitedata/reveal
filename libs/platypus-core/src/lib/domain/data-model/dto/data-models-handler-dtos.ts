export interface FetchDataModelDTO {
  dataModelId: string;
}

export interface CreateDataModelDTO {
  name: string;
  description?: string;
  owner?: string;
  metadata?: {
    [key: string]: string | number | boolean;
  };
}

export interface DeleteDataModelDTO {
  id: string;
}
