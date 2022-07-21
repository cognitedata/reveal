import { MockData } from './app/types';
import {
  assetsMockData,
  datasetsMockData,
  eventsMockData,
  timeseriesMockData,
  datapointsMockData,
  templategroupsMockData,
  templatesMockData,
  filesMockData,
  groupsMockData,
  transformationsMockData,
} from '@platypus/mock-data';

export const mockDataSample = {
  assets: assetsMockData,
  timeseries: timeseriesMockData,
  datapoints: datapointsMockData,
  events: eventsMockData,
  datasets: datasetsMockData,
  templategroups: templategroupsMockData,
  templates: templatesMockData,
  files: filesMockData,
  groups: groupsMockData,
  transformations: transformationsMockData,
  posts: [{ id: 1, title: 'json-server', author: 'typicode' }],
  spaces: [{ externalId: 'blog' }],
  models: [
    {
      spaceExternalId: 'blog',
      externalId: 'PostTable',
      properties: {
        title: {
          type: 'text',
          nullable: false,
        },
        views: {
          type: 'int32',
          nullable: false,
        },
        user: {
          type: 'direct_relation',
          nullable: true,
          targetModelExternalId: 'UserTable',
        },
      },
    },
    {
      spaceExternalId: 'blog',
      externalId: 'UserTable',
      properties: {
        name: {
          type: 'text',
          nullable: false,
        },
      },
    },
    {
      spaceExternalId: 'blog',
      externalId: 'CommentTable',
      properties: {
        body: {
          type: 'text',
          nullable: false,
        },
        date: {
          type: 'int32',
          nullable: false,
        },
        post: {
          type: 'direct_relation',
          nullable: true,
          targetModelExternalId: 'PostTable',
        },
      },
    },
  ],
  nodes: [
    {
      model: 'UserTable',
      externalId: 'user_1',
      name: 'John Doe',
    },
    {
      model: 'UserTable',
      externalId: 'user_2',
      name: 'James Bond',
    },
    {
      model: 'PostTable',
      externalId: 'post_1',
      title: 'Random post 1',
      views: 10,
      user: 'user_1',
    },
    {
      model: 'PostTable',
      externalId: 'post_2',
      title: 'Random post 2',
      views: 12,
      user: 'user_2',
    },
    {
      model: 'CommentTable',
      externalId: 'comment_1',
      body: 'Random comment 1',
      date: 164744,
      post: 'post_1',
    },
  ],
  edges: [],
  schema: [
    {
      externalId: 'blog',
      name: 'blog',
      description: 'blog',
      metadata: {},
      createdTime: 1625702400000,
      versions: [
        {
          version: 1,
          createdTime: 1651346026630,
          bindings: [
            {
              targetName: 'Post',
              dataModelStorageMappingSource: {
                filter: {
                  and: [
                    {
                      hasData: {
                        models: [['blog', 'Post_1']],
                      },
                    },
                  ],
                },
                properties: [
                  {
                    from: {
                      property: ['blog', 'Post_1', '.*'],
                    },
                  },
                ],
              },
            },
            {
              targetName: 'User',
              dataModelStorageMappingSource: {
                filter: {
                  and: [
                    {
                      hasData: {
                        models: [['blog', 'User_1']],
                      },
                    },
                  ],
                },
                properties: [
                  {
                    from: {
                      property: ['blog', 'User_1', '.*'],
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
                        models: [['blog', 'Comment_1']],
                      },
                    },
                  ],
                },
                properties: [
                  {
                    from: {
                      property: ['blog', 'Comment_1', '.*'],
                    },
                  },
                ],
              },
            },
          ],
          dataModel: {
            graphqlRepresentation:
              'type Post {\n  title: String!\n  views: Int!\n  user: User\n tags: [String]\n comments: [Comment]\n}\n\ntype User {\n  name: String!\n}\n\ntype Comment {\n  body: String!\n  date: Timestamp!\n  post: Post\n}',
            types: [],
          },
        },
      ],
      db: {
        Post_1: [
          {
            id: 1,
            externalId: '1',
            title: 'Lorem Ipsum',
            views: 254,
            user: { id: 123 },
            tags: ['Lorem', 'Ipsum'],
            comments: [{ id: 987 }, { id: 995 }],
          },
          {
            id: 2,
            externalId: '2',
            title: 'Sic Dolor amet',
            views: 65,
            user: { id: 456 },
            tags: ['Sic', 'Dolor'],
            comments: [],
          },
          {
            id: 3,
            externalId: '3',
            title: 'Lorem Sic Dolor amet',
            views: 100,
            user: { id: 456 },
            tags: ['Dolor', 'Lorem'],
            comments: [],
          },
        ],
        User_1: [
          { id: 123, name: 'John Doe' },
          { id: 456, name: 'Jane Doe' },
        ],
        Comment_1: [
          {
            id: 987,
            externalId: '987',
            post: { id: 1 },
            body: 'Consectetur adipiscing elit',
            date: 1651346026630,
          },
          {
            id: 995,
            externalId: '995',
            post: { id: 1 },
            body: 'Nam molestie pellentesque dui',
            date: 1651346026630,
          },
        ],
      },
    },
  ],
} as MockData;
