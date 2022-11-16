import { SpaceDTO } from '../../dto/dms-space-dtos';
import { SpacesApiService } from './spaces-api.service';

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

const spaces: SpaceDTO[] = [
  {
    space: 'test-space-1',
  },
];

describe('DMS v3 - Spaces', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsert', () => {
    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new SpacesApiService(cdfClient);

      service.upsert(spaces);
      expect(cdfClient.post).toHaveBeenCalledWith(`${service.baseUrl}/spaces`, {
        headers: service.defaultHeaders,
        data: {
          items: spaces,
        },
      });
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new SpacesApiService(cdfClient);

      expect(Array.isArray(await service.upsert(spaces))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new SpacesApiService(cdfClient);

      return await expect(service.upsert(spaces)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('list', () => {
    const queryParams = { limit: 10 };

    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new SpacesApiService(cdfClient);

      service.list(queryParams);
      expect(cdfClient.get).toHaveBeenCalledWith(`${service.baseUrl}/spaces`, {
        headers: service.defaultHeaders,
        params: queryParams,
      });
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new SpacesApiService(cdfClient);

      expect(Array.isArray(await service.list(queryParams))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new SpacesApiService(cdfClient);

      return await expect(service.list(queryParams)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('getByIds', () => {
    const ids = ['1', '2'];
    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new SpacesApiService(cdfClient);

      service.getByIds(ids);
      expect(cdfClient.post).toHaveBeenCalledWith(
        `${service.baseUrl}/spaces/byids`,
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
      const service = new SpacesApiService(cdfClient);

      expect(Array.isArray(service.getByIds(ids))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new SpacesApiService(cdfClient);

      return await expect(service.getByIds(ids)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });
});
