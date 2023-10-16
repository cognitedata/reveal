import { DataModelDTO } from '../../providers/fdm-next/dto/dms-data-model-dtos';
import { ViewReference } from '../../providers/fdm-next/dto/dms-view-dtos';

export interface DeleteDataModelDTO {
  space: string;
  externalId: string;
}

export type DeleteDataModelOutput = {
  success: boolean;
  referencedViews?: (ViewReference & { dataModels: DataModelDTO[] })[];
};
