import { mixerApiInlineTypeDirectiveName } from '../constants';
import {
  DataModel,
  DataModelVersion,
  DataModelTypeDefs,
  DataModelVersionStatus,
} from '../types';

import { DataModelStorageBuilderService } from './data-model-storage-builder.service';

const solutionMock: DataModel = {
  id: 'app-dev-test-1',
  name: 'App Dev Test',
  createdTime: 0,
  updatedTime: 0,
  owners: [''],
  version: '1',
};
const solutionSchemaMock: DataModelVersion = {
  externalId: 'app-dev-test-1-schema-1',
  status: DataModelVersionStatus.DRAFT,
  createdTime: 0,
  lastUpdatedTime: 0,
  schema: '',
  version: '1',
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
    {
      name: 'User',
      directives: [
        {
          name: mixerApiInlineTypeDirectiveName,
        },
      ],
      fields: [
        {
          name: 'name',
          type: {
            name: 'String',
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
          externalId: 'Post_1',
          properties: {
            body: {
              type: 'text',
              nullable: false,
            },
          },
        },
        {
          externalId: 'Comment_1',
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
              targetModel: ['app-dev-test-1', 'Post_1'],
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
        dataModelStorageMappingSource: {
          filter: {
            and: [
              {
                hasData: {
                  models: [['app-dev-test-1', 'Post_1']],
                },
              },
            ],
          },
          properties: [
            {
              from: {
                property: ['app-dev-test-1', 'Post_1', '.*'],
              },
            },
          ],
        },
      },
      {
        targetName: 'Comment',
        dataModelStorageMappingSource: {
          filter: {
            and: [
              {
                hasData: {
                  models: [['app-dev-test-1', 'Comment_1']],
                },
              },
            ],
          },
          properties: [
            {
              from: {
                property: ['app-dev-test-1', 'Comment_1', '.*'],
              },
            },
          ],
        },
      },
    ];

    expect(dmsBindings).toEqual(expected);
  });
});
