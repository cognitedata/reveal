import { PlatypusError } from '@platypus-core/boundaries/types';

import {
  DeleteInstancesDTO,
  IngestInstancesDTO,
  PublishDataModelVersionDTO,
} from '../../dto';
import {
  DataModelTypeDefsType,
  DataModelVersionStatus,
  SpaceDTO,
} from '../../types';

import { GraphQlDmlVersionDTO } from './dto/mixer-api-dtos';
import { FdmClient } from './fdm-client';

const graphqlServiceMock = {
  working: {
    parseSchema: jest.fn(() => ({})),
  },
} as any;

const spacesApiMock = {
  working: {
    list: jest.fn(() =>
      Promise.resolve({
        items: [{ space: 'test-space', name: 'Test_Space_Name' }],
      })
    ),
    upsert: jest.fn((dto: SpaceDTO[]) => Promise.resolve({ items: dto })),
  },
} as any;

const dataModels = [
  {
    space: 'ABC',
    externalId: 'DM1',
    version: '1',
    createdTime: 1677323010547,
    lastUpdatedTime: 1677323060528,
    name: 'DM1',
    description: '',
    graphqlSchema:
      'type A {\n    name: String\n}\ntype B {\n    name: String\n}',
    views: [
      {
        type: 'view',
        space: 'ABC',
        externalId: 'A',
        version: '1',
      },
      {
        type: 'view',
        space: 'ABC',
        externalId: 'B',
        version: '1',
      },
    ],
  },
  {
    space: 'ABC',
    externalId: 'DM2',
    version: '1',
    createdTime: 1677323083652,
    lastUpdatedTime: 1677323108130,
    name: 'DM2',
    description: '',
    graphqlSchema:
      'type A {\n    name: String\n}\ntype B {\n    name: String\n}\ntype C {\n    name: String\n}',
    views: [
      {
        type: 'view',
        space: 'ABC',
        externalId: 'A',
        version: '1',
      },
      {
        type: 'view',
        space: 'ABC',
        externalId: 'B',
        version: '1',
      },
      {
        type: 'view',
        space: 'ABC',
        externalId: 'C',
        version: '1',
      },
    ],
  },
  {
    space: 'ABCD',
    externalId: 'DM3',
    version: '1',
    createdTime: 1677323123565,
    lastUpdatedTime: 1677323181388,
    name: 'DM3',
    description: '',
    graphqlSchema:
      'type A @view(space:"ABC") {\n    name: String\n}\n\ntype D {\n    name: String\n}',
    views: [
      {
        type: 'view',
        space: 'ABC',
        externalId: 'A',
        version: '1',
      },
      {
        type: 'view',
        space: 'ABCD',
        externalId: 'D',
        version: '1',
      },
    ],
  },
];

const dataModelsApiMock = {
  working: {
    getByIds: jest.fn(
      (params: { items: { space: string; externalId: string }[] }) =>
        Promise.resolve({
          items: dataModels.filter((dm) =>
            params.items.some(
              (el) => el.externalId === dm.externalId && el.space === dm.space
            )
          ),
        })
    ),
    list: jest.fn(() =>
      Promise.resolve({
        items: dataModels,
      })
    ),
    delete: jest.fn((dto: SpaceDTO[]) => Promise.resolve({ items: dto })),
  },
} as any;

const instancesApiMock = {
  working: {
    upsert: jest.fn((dto: IngestInstancesDTO) =>
      Promise.resolve({
        items: dto.items,
      })
    ),
    delete: jest.fn((dto: DeleteInstancesDTO[]) =>
      Promise.resolve({ items: dto })
    ),
  },
} as any;

const viewsApiMock = {
  working: {
    delete: jest.fn((dto: SpaceDTO[]) => Promise.resolve({ items: dto })),
  },
} as any;

const containersApiMock = {
  working: {
    delete: jest.fn((dto: SpaceDTO[]) => Promise.resolve({ items: dto })),
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

describe('FDM v3 Client', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create data model', () => {
    test('sends correct payload', async () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        spacesApi,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApi,
        graphqlService,
        transformationsService,
        instancesApiMock.working
      );

      await fdmClient.createDataModel({
        name: 'Test',
        externalId: 'Test',
        description: 'Test',
        space: 'Test',
      });
      expect(mixerApi.upsertVersion).toHaveBeenCalledWith({
        space: 'Test',
        externalId: 'Test',
        name: 'Test',
        description: 'Test',
        version: '1',
      });
    });

    test('throws error if data model with external-id already exists', async () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        spacesApi,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApi,
        graphqlService,
        transformationsService,
        instancesApiMock.working
      );

      const dto = {
        name: 'name',
        externalId: 'existingDataModel',
        space: 'space',
      };

      //Taken from https://stackoverflow.com/a/72004768/8504149
      const throwingFunction = () => fdmClient.createDataModel(dto);

      // This is what prevents the test to succeed when the promise is resolved and not rejected
      expect.assertions(2);
      await throwingFunction().catch((error) => {
        expect(error).toBeInstanceOf(PlatypusError);
        expect(error.message).toMatch(
          'Could not create data model. Data model with external-id existingDataModel already exists in space space'
        );
      });
    });
  });

  describe('list data models', () => {
    test('sends correct payload', async () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        spacesApi,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApi,
        graphqlService,
        transformationsService,
        instancesApiMock.working
      );

      await fdmClient.listDataModels();
      expect(mixerApi.listDataModelVersions).toHaveBeenCalled();
    });
  });

  describe('validate data model version', () => {
    test('sends correct payload', () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        spacesApi,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApi,
        graphqlService,
        transformationsService,
        instancesApiMock.working
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
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        spacesApi,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApi,
        graphqlService,
        transformationsService,
        instancesApiMock.working
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
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        spacesApi,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApi,
        graphqlService,
        transformationsService,
        instancesApiMock.working
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
    test('should run graphql query', async () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        spacesApi,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApi,
        graphqlService,
        transformationsService,
        instancesApiMock.working
      );

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
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        spacesApi,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApi,
        graphqlService,
        transformationsService,
        instancesApiMock.working
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

  describe('should fetch spaces', () => {
    test('sends correct payload', async () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        spacesApi,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApi,
        graphqlService,
        transformationsService,
        instancesApiMock.working
      );

      const spaces = await fdmClient.getSpaces({});

      expect(spacesApi.list).toHaveBeenCalled();
      expect(spaces).toStrictEqual([
        { space: 'test-space', name: 'Test_Space_Name' },
      ]);
    });
  });

  describe('should create new space', () => {
    test('sends correct payload', async () => {
      const spacesApi = spacesApiMock.working;
      const mixerApi = mixerApiMock.working;
      const graphqlService = graphqlServiceMock.working;
      const transformationsService = transformationApiMock.working;
      const fdmClient = new FdmClient(
        spacesApi,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApi,
        graphqlService,
        transformationsService,
        instancesApiMock.working
      );

      const newSpace = await fdmClient.createSpace({
        space: 'testSpace',
        name: 'testSpaceName',
      });

      expect(spacesApi.upsert).toHaveBeenCalledWith([
        {
          space: 'testSpace',
          name: 'testSpaceName',
        },
      ]);
      expect(newSpace).toStrictEqual({
        space: 'testSpace',
        name: 'testSpaceName',
      });
    });
  });

  describe('should delete data model', () => {
    test('delete data model - simple', async () => {
      const fdmClient = new FdmClient(
        spacesApiMock.working,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApiMock.working,
        graphqlServiceMock.working,
        transformationApiMock.working,
        instancesApiMock.working
      );

      const response = await fdmClient.deleteDataModel(
        {
          space: 'ABCD',
          externalId: 'DM3',
        },
        true
      );
      // A and B are kept because they are imported in DM 1 and DM2
      expect(response.referencedViews).toEqual([
        {
          externalId: 'A',
          space: 'ABC',
          version: '1',
          dataModels: [
            expect.objectContaining({
              name: 'DM1',
            }),
            expect.objectContaining({
              name: 'DM2',
            }),
          ],
        },
      ]);
      expect(response.success).toBe(true);
    });
    test('delete data model - complex', async () => {
      const fdmClient = new FdmClient(
        spacesApiMock.working,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApiMock.working,
        graphqlServiceMock.working,
        transformationApiMock.working,
        instancesApiMock.working
      );

      const response = await fdmClient.deleteDataModel(
        {
          space: 'ABC',
          externalId: 'DM2',
        },
        true
      );
      // A and B are kept because they are imported in DM 1 and DM3
      expect(response.referencedViews).toEqual([
        {
          externalId: 'A',
          space: 'ABC',
          version: '1',
          dataModels: [
            expect.objectContaining({
              name: 'DM1',
            }),
            expect.objectContaining({
              name: 'DM3',
            }),
          ],
        },
        {
          externalId: 'B',
          space: 'ABC',
          version: '1',
          dataModels: [
            expect.objectContaining({
              name: 'DM1',
            }),
          ],
        },
      ]);
      expect(response.success).toBe(true);
    });
    test('delete data model - complex - views check', async () => {
      const fdmClient = new FdmClient(
        spacesApiMock.working,
        containersApiMock.working,
        viewsApiMock.working,
        dataModelsApiMock.working,
        mixerApiMock.working,
        graphqlServiceMock.working,
        transformationApiMock.working,
        instancesApiMock.working
      );

      dataModelsApiMock.working.list.mockImplementation(async () =>
        Promise.resolve({
          items: dataModels.filter((el) => el.externalId !== 'DM1'),
        })
      );

      const responseA = await fdmClient.deleteDataModel(
        {
          space: 'ABC',
          externalId: 'DM2',
        },
        true
      );
      // A is kept because they are imported in DM3
      expect(responseA.referencedViews).toEqual(
        expect.objectContaining([
          {
            externalId: 'A',
            space: 'ABC',
            version: '1',
            dataModels: [
              expect.objectContaining({
                name: 'DM3',
              }),
            ],
          },
        ])
      );
      expect(responseA.success).toBe(true);

      dataModelsApiMock.working.list.mockImplementation(async () =>
        Promise.resolve({
          items: dataModels.filter(
            (el) => el.externalId !== 'DM1' && el.externalId !== 'DM3'
          ),
        })
      );

      const responseB = await fdmClient.deleteDataModel(
        {
          space: 'ABC',
          externalId: 'DM2',
        },
        true
      );
      // all views are deleted
      expect(responseB.referencedViews).toEqual([]);
      expect(responseB.success).toBe(true);
    });
  });
});
