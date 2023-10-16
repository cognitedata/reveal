import { PlatypusError } from '../../../../boundaries/types';
import { IGraphQlSchemaValidator } from '../../boundaries';
import { IngestInstancesDTO, PublishDataModelVersionDTO } from '../../dto';
import { DataModelTypeDefsType, DataModelVersionStatus } from '../../types';

import { GraphQlDmlVersionDTO } from './dto/mixer-api-dtos';
import { FdmClient } from './fdm-client';

const instancesApiMock = {
  working: {
    upsert: jest.fn((dto: IngestInstancesDTO) =>
      Promise.resolve({
        items: dto.items,
      })
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
    getDataModelVersionsById: jest.fn(
      (space, dataModelId): Promise<GraphQlDmlVersionDTO[]> => {
        if (dataModelId === 'existingDataModel') {
          return Promise.resolve([
            {
              space: space,
              externalId: 'existingDataModel',
              version: '1',
              name: 'name',
              description: undefined,
              graphQlDml: undefined,
              createdTime: undefined,
              lastUpdatedTime: undefined,
              views: [],
            },
          ]);
        } else {
          return Promise.reject(
            new PlatypusError(
              `Data model with external-id ${dataModelId} does not exist.`,
              'NOT_FOUND',
              404
            )
          );
        }
      }
    ),
    listDataModelVersions: jest.fn(() => Promise.resolve([])),
    runQuery: jest.fn(() => Promise.resolve({ data: { listPerson: [] } })),
  },
} as any;

const transformationApiMock = {
  working: {
    getTransformationsForType: jest.fn(() =>
      Promise.resolve({
        items: [],
      })
    ),
    createTransformation: jest.fn(() => Promise.resolve([])),
  },
} as any;

const graphQlValidatorMock = {
  validate: jest.fn(() => ({ valid: true, errors: [] })),
} as unknown as IGraphQlSchemaValidator;

describe('FDM v3 Client', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate data model version', () => {
    test('sends correct payload', () => {
      const mixerApi = mixerApiMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        mixerApi,
        transformationsService,
        instancesApiMock.working,
        graphQlValidatorMock
      );

      fdmClient.validateDataModel({
        externalId: '',
        status: 'DRAFT' as DataModelVersionStatus,
        version: '',
        schema: '',
        createdTime: 0,
        lastUpdatedTime: 0,
        space: '',
      });

      // TODO skipping validation while we integrate with V3 Mixer API
      // expect(mixerApi.validateVersion).toHaveBeenCalled();
    });
  });

  describe('publish data models', () => {
    test('sends correct payload', async () => {
      const mixerApi = mixerApiMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        mixerApi,
        transformationsService,
        instancesApiMock.working,
        graphQlValidatorMock
      );

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
        name: dto.name,
        description: dto.description,
      } as GraphQlDmlVersionDTO;

      expect(mixerApi.upsertVersion).toHaveBeenCalledWith(mixerApiDto);
    });

    test('returns deserialized data model when upsert call succeeds', () => {
      const mixerApi = mixerApiMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        mixerApi,
        transformationsService,
        instancesApiMock.working,
        graphQlValidatorMock
      );

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
    test('should fetch data for data model', async () => {
      const mixerApi = mixerApiMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        mixerApi,
        transformationsService,
        instancesApiMock.working,
        graphQlValidatorMock
      );

      await fdmClient.fetchData({
        cursor: '',
        dataModelVersion: {
          externalId: 'testExternalId',
          version: '1',
          space: 'testSpace',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
          views: [],
        },
        limit: 10,
        nestedLimit: 10,
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
