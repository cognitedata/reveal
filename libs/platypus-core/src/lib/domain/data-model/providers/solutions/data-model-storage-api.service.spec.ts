import { rejects } from 'assert';
import { DataModelStorageApiService } from './data-model-storage-api.service';

const cdfClientMock = {
  working: {
    project: 'test',
    post: jest.fn(() => Promise.resolve({ data: {} })),
  },
  broken: {
    project: 'test',
    post: jest.fn(() => {
      throw {
        errors: ['error1', 'error2'],
        code: 400,
        message: 'broken promise',
        type: 'VALIDATION',
      };
    }),
  },
} as any;

describe('data-model-storage-api-service', () => {
  describe('listSpaces', () => {
    test('sends valid POST request', () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);
      service.listSpaces();

      expect(cdfClient.post).toHaveBeenCalledWith(
        `/api/v1/projects/${cdfClient.project}/datamodelstorage/spaces/list`,
        {
          data: {},
          headers: {
            'cdf-version': 'alpha',
          },
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);

      expect(Array.isArray(await service.listSpaces())).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelStorageApiService(cdfClient);
      try {
        await service.listSpaces();
      } catch (e) {
        expect(e).toMatchObject({
          errors: ['error1', 'error2'],
          code: 400,
          message: 'broken promise',
          type: 'VALIDATION',
        });
      }
    });
  });

  // describe('applySpaces', () => {
  //   const payload = [
  //     {
  //       externalId: 'test',
  //     },
  //   ];

  //   test('sends valid POST request', () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);
  //     service.applySpaces(payload);

  //     expect(cdfClient.post).toHaveBeenCalledWith(
  //       `/api/v1/projects/${cdfClient.project}/datamodelstorage/spaces`,
  //       {
  //         data: {
  //           items: payload,
  //         },
  //         headers: {
  //           'cdf-version': 'alpha',
  //         },
  //       }
  //     );
  //   });

  //   test('returns an array when called successfully', async () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     expect(Array.isArray(await service.applySpaces(payload))).toBeTruthy;
  //   });

  //   test('handles and returns errors', async () => {
  //     const cdfClient = cdfClientMock.broken;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     return await expect(service.applySpaces(payload)).rejects.toMatchObject({
  //       status: 400,
  //       errors: [],
  //     });
  //   });
  // });

  // describe('deleteSpaces', () => {
  //   const payload = [
  //     {
  //       externalId: 'test',
  //     },
  //   ];

  //   test('sends valid POST request', () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);
  //     service.deleteSpaces(payload);

  //     expect(cdfClient.post).toHaveBeenCalledWith(
  //       `/api/v1/projects/${cdfClient.project}/datamodelstorage/spaces/delete`,
  //       {
  //         data: { items: payload },
  //         headers: {
  //           'cdf-version': 'alpha',
  //         },
  //       }
  //     );
  //   });

  //   test('returns an array when called successfully', async () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     expect(Array.isArray(await service.deleteSpaces(payload))).toBeTruthy;
  //   });

  //   test('handles and returns errors', async () => {
  //     const cdfClient = cdfClientMock.broken;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     return await expect(service.deleteSpaces(payload)).rejects.toMatchObject({
  //       status: 400,
  //       errors: [],
  //     });
  //   });
  // });

  // describe('getSpacesById', () => {
  //   const payload = [
  //     {
  //       externalId: 'test',
  //     },
  //   ];

  //   test('sends valid POST request', () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);
  //     service.getSpacesById(payload);

  //     expect(cdfClient.post).toHaveBeenCalledWith(
  //       `/api/v1/projects/${cdfClient.project}/datamodelstorage/spaces/byids`,
  //       {
  //         data: { items: payload },
  //         headers: {
  //           'cdf-version': 'alpha',
  //         },
  //       }
  //     );
  //   });

  //   test('returns an array when called successfully', async () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     expect(Array.isArray(await service.getSpacesById(payload))).toBeTruthy;
  //   });

  //   test('handles and returns errors', async () => {
  //     const cdfClient = cdfClientMock.broken;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     return await expect(service.getSpacesById(payload)).rejects.toMatchObject(
  //       {
  //         status: 400,
  //         errors: [],
  //       }
  //     );
  //   });
  // });

  // describe('listModels', () => {
  //   test('sends valid POST request', () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);
  //     service.listModels();

  //     expect(cdfClient.post).toHaveBeenCalledWith(
  //       `/api/v1/projects/${cdfClient.project}/datamodelstorage/definitions/list`,
  //       {
  //         data: {
  //           includeInheritedProperties: true,
  //         },
  //         headers: {
  //           'cdf-version': 'alpha',
  //         },
  //       }
  //     );
  //   });

  //   test('returns an array when called successfully', async () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     expect(Array.isArray(await service.listModels())).toBeTruthy;
  //   });

  //   test('handles and returns errors', async () => {
  //     const cdfClient = cdfClientMock.broken;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     return await expect(service.listModels()).rejects.toMatchObject({
  //       status: 400,
  //       errors: [],
  //     });
  //   });
  // });

  // describe('listInstances', () => {
  //   const payload = {
  //     modelExternalId: 'test',
  //     filter: 'test',
  //     sort: ['test1', 'test2'],
  //     limit: 10,
  //     cursor: 'test',
  //   };
  //   test('sends valid POST request', () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);
  //     service.listInstances(payload);

  //     expect(cdfClient.post).toHaveBeenCalledWith(
  //       `/api/v1/projects/${cdfClient.project}/datamodelstorage/instances/list`,
  //       {
  //         data: payload,
  //         headers: {
  //           'cdf-version': 'alpha',
  //         },
  //       }
  //     );
  //   });

  //   test('returns an array when called successfully', async () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     expect(Array.isArray(await service.listInstances(payload))).toBeTruthy;
  //   });

  //   test('handles and returns errors', async () => {
  //     const cdfClient = cdfClientMock.broken;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     return await expect(service.listInstances(payload)).rejects.toMatchObject(
  //       {
  //         status: 400,
  //         errors: [],
  //       }
  //     );
  //   });
  // });

  // describe('upsertModel', () => {
  //   const payload = {
  //     externalId: 'test',
  //     properties: {
  //       test: {
  //         type: 'string',
  //         nullable: true,
  //       },
  //       test2: {
  //         type: 'string',
  //         nullable: true,
  //       },
  //     },
  //   };

  //   test('sends valid POST request', () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     service.upsertModel([payload]);

  //     expect(cdfClient.post).toHaveBeenCalledWith(
  //       `/api/v1/projects/${cdfClient.project}/datamodelstorage/definitions/apply`,
  //       {
  //         data: [payload],
  //         headers: {
  //           'cdf-version': 'alpha',
  //         },
  //       }
  //     );
  //   });

  //   test('returns an array when called successfully', async () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     expect(Array.isArray(await service.upsertModel([payload]))).toBeTruthy;
  //   });

  //   test('handles and returns errors', async () => {
  //     const cdfClient = cdfClientMock.broken;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     return await expect(service.upsertModel([payload])).rejects.toMatchObject(
  //       {
  //         status: 400,
  //         errors: [],
  //       }
  //     );
  //   });
  // });

  // describe('ingestInstances', () => {
  //   const payload = {
  //     modelExternalId: 'test',
  //     properties: {
  //       test: 123,
  //       test2: true,
  //       test3: 'test',
  //     },
  //   };

  //   test('sends valid POST request', () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);
  //     service.ingestInstances([payload]);

  //     expect(cdfClient.post).toHaveBeenCalledWith(
  //       `/api/v1/projects/${cdfClient.project}/datamodelstorage/instances/ingest`,
  //       {
  //         data: { items: [payload] },
  //         headers: {
  //           'cdf-version': 'alpha',
  //         },
  //       }
  //     );
  //   });

  //   test('returns an array when called successfully', async () => {
  //     const cdfClient = cdfClientMock.working;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     expect(Array.isArray(await service.ingestInstances([payload])))
  //       .toBeTruthy;
  //   });

  //   test('handles and returns errors', async () => {
  //     const cdfClient = cdfClientMock.broken;
  //     const service = new DataModelStorageApiService(cdfClient);

  //     return await expect(
  //       service.ingestInstances([payload])
  //     ).rejects.toMatchObject({
  //       status: 400,
  //       errors: [],
  //     });
  //   });
  // });
});
