import { DataModelDTO } from '../../dto/dms-data-model-dtos';
import { DataModelsApiService } from './data-models-api.service';

const cdfClientMock = {
  working: {
    project: 'test',
    post: jest.fn(() => Promise.resolve({ data: {} })),
    get: jest.fn(() => Promise.resolve({ data: {} })),
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
    get: jest.fn(() => {
      throw {
        errors: ['error1', 'error2'],
        code: 400,
        message: 'broken promise',
        type: 'VALIDATION',
      };
    }),
  },
} as any;

const dataModels: DataModelDTO[] = [
  {
    space: 'test-space-1',
    externalId: 'external-id-1',
    version: '1',
  },
];

describe('DMS v3 - Data models', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsert', () => {
    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelsApiService(cdfClient);

      service.upsert(dataModels);
      expect(cdfClient.post).toHaveBeenCalledWith(
        `${service.baseUrl}/datamodels`,
        {
          headers: service.defaultHeaders,
          data: {
            items: dataModels,
          },
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelsApiService(cdfClient);

      expect(Array.isArray(await service.upsert(dataModels))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelsApiService(cdfClient);

      return await expect(service.upsert(dataModels)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('list', () => {
    const queryParams = { limit: 10 };

    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelsApiService(cdfClient);

      service.list(queryParams);
      expect(cdfClient.get).toHaveBeenCalledWith(
        `${service.baseUrl}/datamodels`,
        {
          headers: service.defaultHeaders,
          params: queryParams,
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelsApiService(cdfClient);

      expect(Array.isArray(await service.list(queryParams))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelsApiService(cdfClient);

      return await expect(service.list(queryParams)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('filter', () => {
    const filterParams = {
      filter: {
        equals: {
          property: ['externalId'],
          value: 'external-id-1',
        },
      },
    };

    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelsApiService(cdfClient);

      service.filter(filterParams);
      expect(cdfClient.post).toHaveBeenCalledWith(
        `${service.baseUrl}/datamodels/list`,
        {
          headers: service.defaultHeaders,
          data: filterParams,
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelsApiService(cdfClient);

      expect(Array.isArray(await service.filter(filterParams))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelsApiService(cdfClient);

      return await expect(service.filter(filterParams)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('getByIds', () => {
    const params = {
      items: [
        { space: '1', externalId: '1' },
        { space: '2', externalId: '2' },
      ],
    };
    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelsApiService(cdfClient);

      service.getByIds(params);
      expect(cdfClient.post).toHaveBeenCalledWith(
        `${service.baseUrl}/datamodels/byids`,
        {
          data: params,
          headers: service.defaultHeaders,
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelsApiService(cdfClient);

      expect(Array.isArray(service.getByIds(params))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelsApiService(cdfClient);

      return await expect(service.getByIds(params)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('delete', () => {
    const items = {
      items: [
        { space: '1', externalId: '1' },
        { space: '2', externalId: '2' },
      ],
    };
    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelsApiService(cdfClient);

      service.delete(items);
      expect(cdfClient.post).toHaveBeenCalledWith(
        `${service.baseUrl}/datamodels/delete`,
        {
          data: items,
          headers: service.defaultHeaders,
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new DataModelsApiService(cdfClient);

      expect(Array.isArray(service.delete(items))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new DataModelsApiService(cdfClient);

      return await expect(service.delete(items)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });
});
