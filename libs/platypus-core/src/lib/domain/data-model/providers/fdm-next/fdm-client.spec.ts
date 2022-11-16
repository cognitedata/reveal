import { FdmClient } from './fdm-client';

const spacesApiMock = {
  working: {
    upsert: jest.fn(() =>
      Promise.resolve({ items: [{ space: 'Test', name: 'Test' }] })
    ),
  },
} as any;

const mixerApiMock = {
  working: {
    upsertVersion: jest.fn(() =>
      Promise.resolve({
        errors: [],
        result: {
          externalId: 'Test',
          version: '1',
          graphQlDml: 'type Test { name }',
        },
      })
    ),
    listDataModelVersions: jest.fn(() => Promise.resolve([])),
  },
} as any;

describe('FDM v3 Client', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create data model', () => {
    test('sends correct payload', async () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const fdmClient = new FdmClient(spacesApi, mixerApi);

      await fdmClient.createDataModel({
        name: 'Test',
        externalId: 'Test',
        description: 'Test',
      });
      expect(spacesApi.upsert).toHaveBeenCalledWith([
        {
          space: 'Test',
          name: 'Test',
        },
      ]);
      expect(mixerApi.upsertVersion).toHaveBeenCalledWith({
        space: 'Test',
        externalId: 'Test',
        name: 'Test',
        description: 'Test',
        version: '1',
      });
    });
  });

  describe('list data models', () => {
    test('sends correct payload', async () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const fdmClient = new FdmClient(spacesApi, mixerApi);

      await fdmClient.listDataModels();
      expect(mixerApi.listDataModelVersions).toHaveBeenCalled();
    });
  });
});
