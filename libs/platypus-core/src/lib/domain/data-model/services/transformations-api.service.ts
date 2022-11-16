import { CogniteClient } from '@cognite/sdk';
import { CreateDataModelTransformationDTO } from '../dto';
import { DataModelTransformation } from '../types';

export class TransformationApiService {
  private transformationsBaseUrl: string;
  constructor(private readonly cdfClient: CogniteClient) {
    this.transformationsBaseUrl = `/api/v1/projects/${this.cdfClient.project}/transformations`;
  }

  getTransformationsForType({
    dataModelExternalId,
    typeName,
    version,
  }: {
    dataModelExternalId: string;
    typeName: string;
    version: string;
  }): Promise<DataModelTransformation[]> {
    return new Promise((resolve, reject) => {
      this.cdfClient
        .post(`${this.transformationsBaseUrl}/filter`, {
          data: {
            filter: {
              destinationType: 'datamodelinstances',
            },
            limit: 1000,
          },
        })
        .then((response) => {
          if (response.data.errors) {
            reject(response.data);
          } else {
            const items = (
              response.data.items as DataModelTransformation[]
            ).filter(
              ({ destination }) =>
                destination.type === 'data_model_instances' &&
                destination.modelExternalId.startsWith(typeName) &&
                destination?.modelExternalId.endsWith(`_${version}`) &&
                destination.spaceExternalId === dataModelExternalId
            );
            resolve(items);
          }
        });
    });
  }

  // https://docs.cognite.com/api/v1/#operation/createTransformations
  createTransformation(
    transformation: CreateDataModelTransformationDTO
  ): Promise<DataModelTransformation> {
    return new Promise((resolve, reject) => {
      this.cdfClient
        .post(`${this.transformationsBaseUrl}/`, {
          data: {
            items: [transformation],
          },
        })
        .then((response) => {
          if (response.data.errors) {
            reject(response.data);
          } else {
            resolve(response.data.items[0]);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
