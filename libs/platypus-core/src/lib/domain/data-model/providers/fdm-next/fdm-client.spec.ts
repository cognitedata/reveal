import { PublishDataModelVersionDTO } from '../../dto';
import { DataModelTypeDefsType, DataModelVersionStatus } from '../../types';
import { GraphQlDmlVersionDTO } from './dto/mixer-api-dtos';
import { FdmClient } from './fdm-client';

const graphqlServiceMock = {
  working: {
    parseSchema: jest.fn(() => ({})),
  },
} as any;

const spacesApiMock = {
  working: {
    upsert: jest.fn(() =>
      Promise.resolve({ items: [{ space: 'Test', name: 'Test' }] })
    ),
  },
} as any;

const mixerApiMock = {
  working: {
    validateVersion: jest.fn(() => Promise.resolve([])),
    upsertVersion: jest.fn(() =>
      Promise.resolve({
        errors: [],
        result: {
          externalId: 'external-id',
          space: 'test-space',
          version: '1',
          status: 'PUBLISHED',
          graphQlDml: 'type Post {\n  title: String!\n  views: Int!\n }\n',
          createdTime: 1667260800,
          lastUpdatedTime: 1667260800,
        },
      })
    ),
    listDataModelVersions: jest.fn(() => Promise.resolve([])),
    runQuery: jest.fn(() => Promise.resolve({ data: { listPerson: [] } })),
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
      const graphqlService = graphqlServiceMock.working;
      const fdmClient = new FdmClient(spacesApi, mixerApi, graphqlService);

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
      const graphqlService = graphqlServiceMock.working;
      const fdmClient = new FdmClient(spacesApi, mixerApi, graphqlService);

      await fdmClient.listDataModels();
      expect(mixerApi.listDataModelVersions).toHaveBeenCalled();
    });
  });

  describe('validate data model version', () => {
    test('sends correct payload', () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const fdmClient = new FdmClient(spacesApi, mixerApi, graphqlService);

      fdmClient.validateDataModel({
        externalId: '',
        status: 'DRAFT' as DataModelVersionStatus,
        version: '',
        schema: '',
        createdTime: 0,
        lastUpdatedTime: 0,
        space: '',
      });
      expect(mixerApi.validateVersion).toHaveBeenCalled();
    });
  });

  describe('publish data models', () => {
    test('sends correct payload', async () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const fdmClient = new FdmClient(spacesApi, mixerApi, graphqlService);

      const dto: PublishDataModelVersionDTO = {
        externalId: 'external-id',
        status: DataModelVersionStatus.DRAFT,
        version: '1',
        schema: 'type Post {\n  title: String!\n  views: Int!\n }\n',
        space: 'test-space',
      };
      await fdmClient.publishDataModelVersion(dto, 'PATCH');

      const mixerApiDto = {
        space: dto.space,
        externalId: dto.externalId,
        version: dto.version,
        graphQlDml: dto.schema,
        name: dto.externalId,
        description: dto.externalId,
      } as GraphQlDmlVersionDTO;

      expect(mixerApi.upsertVersion).toHaveBeenCalledWith(mixerApiDto);
    });

    test('returns deserialized data model when upsert call succeeds', () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const fdmClient = new FdmClient(spacesApi, mixerApi, graphqlService);

      const dto: PublishDataModelVersionDTO = {
        externalId: 'external-id',
        status: DataModelVersionStatus.DRAFT,
        version: '1',
        schema: 'type Post {\n  title: String!\n  views: Int!\n }\n',
        space: 'test-space',
      };

      fdmClient.publishDataModelVersion(dto, 'PATCH').then((result) => {
        expect(result).toEqual({
          externalId: 'external-id',
          space: 'test-space',
          version: '1',
          status: 'PUBLISHED',
          schema: 'type Post {\n  title: String!\n  views: Int!\n }\n',
          createdTime: 1667260800,
          lastUpdatedTime: 1667260800,
        });
      });
    });
  });

  describe('should fetch data', () => {
    test('should run graphql query', async () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const fdmClient = new FdmClient(spacesApi, mixerApi, graphqlService);

      const dto = {
        dataModelId: 'testExternalId',
        space: 'testSpace',
        schemaVersion: '1',
        graphQlParams: {
          query: `query { listPerson { items { externalId } } }`,
          variables: { limit: 10 },
        },
      };

      await fdmClient.runQuery(dto);
      expect(mixerApi.runQuery).toHaveBeenCalledWith(
        expect.objectContaining(dto)
      );
    });

    test('should fetch data for data model', async () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const fdmClient = new FdmClient(spacesApi, mixerApi, graphqlService);

      await fdmClient.fetchData({
        cursor: '',
        dataModelVersion: {
          externalId: 'testExternalId',
          version: '1',
          space: 'testSpace',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
        },
        limit: 10,
        hasNextPage: false,
        dataModelType: {
          name: 'Person',
          fields: [],
        } as any as DataModelTypeDefsType,
        dataModelTypeDefs: { types: [] },
      });

      const expectedReqDto = {
        dataModelId: 'testExternalId',
        space: 'testSpace',
        schemaVersion: '1',
      };

      expect(mixerApi.runQuery).toHaveBeenCalledWith(
        expect.objectContaining(expectedReqDto)
      );
    });
  });
});
