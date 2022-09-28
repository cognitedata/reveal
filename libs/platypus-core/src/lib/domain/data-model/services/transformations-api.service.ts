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
  ): Promise<DataModelTransformation | null> {
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
              (el) =>
                el.destination.type === 'data_model_instances' &&
                el.destination?.modelExternalId === type &&
                el.destination.spaceExternalId === externalId
            );
            // Our promise should resolve to singular value, but items[0] could === undefined
            // since filter result could be empty array in that case we fallback to null
            resolve(items[0] ?? null);
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
