import { ViewInstance } from '../../dto/dms-view-dtos';

import { ViewsApiService } from './views-api.service';

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

const views: ViewInstance[] = [
  {
    space: 'a',
    externalId: 'a',
    name: 'a',
    description: 'desc',
    implements: [],
    version: '1',
  },
  {
    space: 'b',
    externalId: 'b',
    name: 'b',
    description: 'desc',
    implements: [
      {
        type: 'view',
        externalId: 'a',
        space: 'a',
        version: '1',
      },
    ],
    version: '1',
  },
];

describe('DMS v3 - Views', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    const queryParams = { limit: 10 };

    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new ViewsApiService(cdfClient);

      service.list(queryParams);
      expect(cdfClient.get).toHaveBeenCalledWith(`${service.baseUrl}/views`, {
        headers: service.defaultHeaders,
        params: queryParams,
      });
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new ViewsApiService(cdfClient);

      expect(Array.isArray(await service.list(queryParams))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new ViewsApiService(cdfClient);

      return await expect(service.list(queryParams)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('getByIds', () => {
    const ids = [
      { externalId: 'a', version: '1', space: 'a' },
      { externalId: 'b', version: '1', space: 'b' },
    ];
    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new ViewsApiService(cdfClient);

      service.getByIds(ids);
      expect(cdfClient.post).toHaveBeenCalledWith(
        `${service.baseUrl}/views/byids`,
        {
          data: {
            items: ids,
          },
          headers: service.defaultHeaders,
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new ViewsApiService(cdfClient);

      expect(Array.isArray(service.getByIds(ids))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new ViewsApiService(cdfClient);

      return await expect(service.getByIds(ids)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });
  describe('delete', () => {
    const ids = [
      { externalId: 'a', version: '1', space: 'a' },
      { externalId: 'b', version: '1', space: 'b' },
    ];
    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new ViewsApiService(cdfClient);

      service.delete(ids);
      expect(cdfClient.post).toHaveBeenCalledWith(
        `${service.baseUrl}/views/delete`,
        {
          data: {
            items: ids,
          },
          headers: service.defaultHeaders,
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new ViewsApiService(cdfClient);

      expect(Array.isArray(service.delete(ids))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new ViewsApiService(cdfClient);

      return await expect(service.delete(ids)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });
});
