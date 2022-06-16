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
  afterEach(() => {
    jest.clearAllMocks();
  });

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

  describe('applySpaces', () => {
    const payload = [
      {
        externalId: 'test',
      },
    ];

    test('sends valid POST request', () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);
      service.applySpaces(payload);

      expect(cdfClient.post).toHaveBeenCalledWith(
        `/api/v1/projects/${cdfClient.project}/datamodelstorage/spaces`,
        {
          data: {
            items: payload,
          },
          headers: {
            'cdf-version': 'alpha',
          },
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);

      expect(Array.isArray(await service.applySpaces(payload))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelStorageApiService(cdfClient);

      return await expect(service.applySpaces(payload)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('deleteSpaces', () => {
    const payload = [
      {
        externalId: 'test',
      },
    ];

    test('sends valid POST request', () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);
      service.deleteSpaces(payload);

      expect(cdfClient.post).toHaveBeenCalledWith(
        `/api/v1/projects/${cdfClient.project}/datamodelstorage/spaces/delete`,
        {
          data: { items: payload },
          headers: {
            'cdf-version': 'alpha',
          },
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);

      expect(Array.isArray(await service.deleteSpaces(payload))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelStorageApiService(cdfClient);

      return await expect(service.deleteSpaces(payload)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('getSpacesById', () => {
    const payload = [
      {
        externalId: 'test',
      },
    ];

    test('sends valid POST request', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);
      await service.getSpacesById(payload);

      expect(cdfClient.post).toHaveBeenCalledWith(
        `/api/v1/projects/${cdfClient.project}/datamodelstorage/spaces/byids`,
        {
          data: payload,
          headers: {
            'cdf-version': 'alpha',
          },
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);

      expect(Array.isArray(await service.getSpacesById(payload))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelStorageApiService(cdfClient);

      return await expect(service.getSpacesById(payload)).rejects.toMatchObject(
        {
          code: 400,
          errors: ['error1', 'error2'],
        }
      );
    });
  });

  describe('listModels', () => {
    const payload = {
      spaceExternalId: 'test',
    };

    test('sends valid POST request', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);
      await service.listModels(payload);

      expect(cdfClient.post).toHaveBeenCalledWith(
        `/api/v1/projects/${cdfClient.project}/datamodelstorage/models/list`,
        {
          data: {
            spaceExternalId: 'test',
          },
          headers: {
            'cdf-version': 'alpha',
          },
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);

      expect(Array.isArray(await service.listModels(payload))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelStorageApiService(cdfClient);

      return await expect(service.listModels(payload)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('listInstances', () => {
    const payload = {
      model: ['test'],
      filter: 'test',
      sort: [
        {
          property: ['field1'],
        },
      ],
      limit: 10,
      cursor: 'test',
    };
    test('sends valid POST request', () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);
      service.filterNodes(payload);

      expect(cdfClient.post).toHaveBeenCalledWith(
        `/api/v1/projects/${cdfClient.project}/datamodelstorage/nodes/list`,
        {
          data: payload,
          headers: {
            'cdf-version': 'alpha',
          },
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);

      expect(Array.isArray(await service.filterNodes(payload))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelStorageApiService(cdfClient);

      return await expect(service.filterNodes(payload)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('upsertModel', () => {
    const payload = {
      spaceExternalId: 'test',
      items: [
        {
          externalId: 'test',
          properties: {
            test: {
              type: 'string',
              nullable: true,
            },
            test2: {
              type: 'string',
              nullable: true,
            },
          },
        },
      ],
    };

    test('sends valid POST request', () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);

      service.upsertModel(payload);

      expect(cdfClient.post).toHaveBeenCalledWith(
        `/api/v1/projects/${cdfClient.project}/datamodelstorage/models`,
        {
          data: payload,
          headers: {
            'cdf-version': 'alpha',
          },
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);

      expect(Array.isArray(await service.upsertModel(payload))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelStorageApiService(cdfClient);

      return await expect(service.upsertModel(payload)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('ingestInstances', () => {
    const payload = {
      spaceExternalId: 'test',
      model: ['modelName'],
      items: [
        {
          externalId: 'test',
          test: 123,
          test2: true,
          test3: 'test',
        },
      ],
    };

    test('sends valid POST request', () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);
      service.ingestNodes(payload);

      expect(cdfClient.post).toHaveBeenCalledWith(
        `/api/v1/projects/${cdfClient.project}/datamodelstorage/nodes`,
        {
          data: payload,
          headers: {
            'cdf-version': 'alpha',
          },
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelStorageApiService(cdfClient);

      expect(Array.isArray(await service.ingestNodes(payload))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelStorageApiService(cdfClient);

      return await expect(service.ingestNodes(payload)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });
});
