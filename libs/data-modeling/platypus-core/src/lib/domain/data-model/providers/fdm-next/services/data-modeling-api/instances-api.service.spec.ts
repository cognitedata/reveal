import { IngestRequestDTO } from '../../dto/dms-instances-dtos';
import { InstancesApiService } from './instances-api.service';

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

describe('DMS v3 - Instances', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ingest', () => {
    const payload: IngestRequestDTO = {
      items: [
        {
          instanceType: 'node',
          space: 'space-id',
          externalId: 'external-id',
          views: [
            {
              view: {
                type: 'view',
                space: 'space-id',
                externalId: 'external-id-1',
                version: '1',
              },
              properties: {
                propertyName: 'string',
              },
            },
          ],
        },
      ],
    };

    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new InstancesApiService(cdfClient);

      service.ingest(payload);
      expect(cdfClient.post).toHaveBeenCalledWith(
        `${service.baseUrl}/instances`,
        {
          headers: service.defaultHeaders,
          data: payload,
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new InstancesApiService(cdfClient);

      expect(Array.isArray(await service.ingest(payload))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new InstancesApiService(cdfClient);

      return await expect(service.ingest(payload)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });

  describe('delete', () => {
    const deletePayload = {
      items: [
        {
          type: 'node' as const,
          externalId: 'external-id',
          space: 'space-id',
        },
      ],
    };

    test('sends correct payload', () => {
      const cdfClient = cdfClientMock.working;
      const service = new InstancesApiService(cdfClient);

      service.delete(deletePayload);
      expect(cdfClient.post).toHaveBeenCalledWith(
        `${service.baseUrl}/instances/delete`,
        {
          headers: service.defaultHeaders,
          data: deletePayload,
        }
      );
    });

    test('returns an array when called successfully', async () => {
      const cdfClient = cdfClientMock.working;
      const service = new InstancesApiService(cdfClient);

      expect(Array.isArray(await service.delete(deletePayload))).toBeTruthy;
    });

    test('handles and returns errors', async () => {
      const cdfClient = cdfClientMock.broken;
      const service = new InstancesApiService(cdfClient);

      return await expect(service.delete(deletePayload)).rejects.toMatchObject({
        code: 400,
        errors: ['error1', 'error2'],
      });
    });
  });
});
