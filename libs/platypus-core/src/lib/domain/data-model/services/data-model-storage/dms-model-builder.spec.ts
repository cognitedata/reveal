import { mixerApiInlineTypeDirectiveName } from '../../constants';
import {
  DataModel,
  DataModelVersion,
  DataModelTypeDefs,
  DataModelVersionStatus,
} from '../../types';

import { DmsModelBuilder } from './dms-model-builder';

const dataModelMock: DataModel = {
  id: 'app-dev-test-1',
  name: 'App Dev Test',
  createdTime: 0,
  updatedTime: 0,
  owners: [''],
  version: '1',
};
const dataModelVersionMock: DataModelVersion = {
  externalId: 'app-dev-test-1-schema-1',
  status: DataModelVersionStatus.DRAFT,
  createdTime: 0,
  lastUpdatedTime: 0,
  schema: '',
  version: '1',
};
const dataModelTypeDefsMock: DataModelTypeDefs = {
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
        {
          name: 'authors',
          type: {
            name: 'User',
            list: true,
            nonNull: false,
          },
          nonNull: false,
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
    return new DmsModelBuilder();
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should build models', () => {
    const service = createInstance();

    const dmsModels = service.build(
      dataModelMock.id,
      dataModelVersionMock,
      dataModelTypeDefsMock
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
        {
          externalId: 'Post_User_authors_1',
          allowNode: false,
          allowEdge: true,
          properties: {
            dummy: {
              nullable: true,
              type: 'text',
            },
          },
        },
      ],
    };

    expect(dmsModels).toEqual(expected);
  });
});
