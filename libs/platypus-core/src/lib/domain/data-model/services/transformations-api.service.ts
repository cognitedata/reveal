import { CogniteClient } from '@cognite/sdk';
import { CreateDataModelTransformationDTO } from '../dto';
import { DataModelTransformation } from '../types';

export class TransformationApiService {
  private transformationsBaseUrl: string;
  constructor(private readonly cdfClient: CogniteClient) {
    this.transformationsBaseUrl = `/api/v1/projects/${this.cdfClient.project}/transformations`;
  }

  getTransformationsForType({
    destination,
    typeName,
    version,
    space,
    instanceSpace,
  }: {
    destination: 'instances' | 'data_model_instances';
    typeName: string;
    space: string;
    instanceSpace: string;
    version: string;
  }): Promise<DataModelTransformation[]> {
    return new Promise((resolve, reject) => {
      this.cdfClient
        .post(`${this.transformationsBaseUrl}/filter`, {
          data: {
            filter: {
              destinationType: destination,
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
            ).filter(({ destination: transformationDest }) => {
              if (destination === 'data_model_instances') {
                return (
                  transformationDest.type === 'data_model_instances' &&
                  transformationDest.modelExternalId.startsWith(typeName) &&
                  transformationDest?.modelExternalId.endsWith(`_${version}`) &&
                  transformationDest.spaceExternalId === space
                );
              } else {
                return (
                  transformationDest.type === 'instances' &&
                  transformationDest.viewExternalId === typeName &&
                  transformationDest.viewVersion === version &&
                  transformationDest.viewSpaceExternalId === space &&
                  transformationDest.instanceSpaceExternalId === instanceSpace
                );
              }
            });
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
