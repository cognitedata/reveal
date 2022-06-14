import {
  DataModel,
  DataModelVersion,
  DataModelTypeDefs,
  DataModelVersionStatus,
} from '../../types';

import { DataModelStorageBuilderService } from './data-model-storage-builder.service';

const solutionMock: DataModel = {
  id: 'app-dev-test-1',
  name: 'App Dev Test',
  createdTime: 0,
  updatedTime: 0,
  owners: [''],
  version: 'v1',
};
const solutionSchemaMock: DataModelVersion = {
  externalId: 'app-dev-test-1-schema-1',
  status: DataModelVersionStatus.DRAFT,
  createdTime: 0,
  lastUpdatedTime: 0,
  schema: '',
  version: 'v1',
};
const dataModelMock: DataModelTypeDefs = {
  types: [
    {
      name: 'Post',
      fields: [
        {
          name: 'body',
          type: {
            name: 'String',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
      ],
    },
    {
      name: 'Comment',
      fields: [
        {
          name: 'body',
          type: {
            name: 'String',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
        {
          name: 'views',
          type: {
            name: 'Int',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
        {
          name: 'post',
          type: {
            name: 'Post',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
      ],
    },
  ],
};

describe('DataModelStorageBuilderServiceTest', () => {
  const createInstance = () => {
    return new DataModelStorageBuilderService();
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should build models', () => {
    const service = createInstance();

    const dmsModels = service.buildModels(
      solutionMock.id,
      solutionSchemaMock,
      dataModelMock
    );

    const expected = {
      spaceExternalId: 'app-dev-test-1',
      items: [
        {
          externalId: 'Post_v1',
          properties: {
            body: {
              type: 'text',
              nullable: false,
            },
          },
        },
        {
          externalId: 'Comment_v1',
          properties: {
            body: {
              type: 'text',
              nullable: false,
            },
            views: {
              type: 'int32',
              nullable: false,
            },
            post: {
              type: 'direct_relation',
              nullable: false,
              targetModel: ['app-dev-test-1', 'Post_v1'],
            },
          },
        },
      ],
    };

    expect(dmsModels).toEqual(expected);
  });

  it('should build bindings', () => {
    const service = createInstance();

    const dmsBindings = service.buildBindings(
      solutionMock.id,
      solutionSchemaMock,
      dataModelMock
    );

    const expected = [
      {
        targetName: 'Post',
        dataModelStorageSource: {
          externalId: 'Post_v1',
          space: 'app-dev-test-1',
        },
      },
      {
        targetName: 'Comment',
        dataModelStorageSource: {
          externalId: 'Comment_v1',
          space: 'app-dev-test-1',
        },
      },
    ];

    expect(dmsBindings).toEqual(expected);
  });
});
