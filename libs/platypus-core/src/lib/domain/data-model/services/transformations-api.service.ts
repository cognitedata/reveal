import { CogniteClient } from '@cognite/sdk';
import { DataModelTransformation } from './../types';

export class TransformationApiService {
  private transformationsBaseUrl: string;
  constructor(private readonly cdfClient: CogniteClient) {
    this.transformationsBaseUrl = `/api/v1/projects/${this.cdfClient.project}/transformations`;
  }

  getTransformationsForType(
    type: string, // e.g 'Room_1'
    externalId: string
  ): Promise<DataModelTransformation> {
    return new Promise((resolve, reject) => {
      this.cdfClient
        .post(`${this.transformationsBaseUrl}/filter`, {
          data: {
            filter: {
              destinationType: 'alphadatamodelinstances',
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
              (el) =>
                el.destination.type === 'alpha_data_model_instances' &&
                el.destination?.modelExternalId === type &&
                el.destination.spaceExternalId === externalId
            );
            resolve(items[0]);
          }
        });
    });
  }
  // https://docs.cognite.com/api/v1/#operation/createTransformations
  createTransformation(
    transformation: Omit<DataModelTransformation, 'id'>
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
            console.log(response);
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
