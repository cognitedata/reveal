import { DataModelDTO } from '../providers/fdm-next/dto/dms-data-model-dtos';
import { ViewReference } from '../providers/fdm-next/dto/dms-view-dtos';

export interface FetchDataModelDTO {
  dataModelId: string;
  space: string;
}

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
export interface UpdateDataModelDTO extends CreateDataModelDTO {
  externalId: string;
  version?: string;
}

export interface DeleteDataModelDTO {
  space: string;
  externalId: string;
}

export type DeleteDataModelOutput = {
  success: boolean;
  referencedViews?: (ViewReference & { dataModels: DataModelDTO[] })[];
};
