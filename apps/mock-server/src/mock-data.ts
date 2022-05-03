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
  posts: [{ id: 1, title: 'json-server', author: 'typicode' }],
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
          bindings: [],
          dataModel: {
            graphqlRepresentation:
              'type Post @view {\n  title: String!\n  views: Int!\n  user: User\n}\n\ntype User @view {\n  name: String!\n}\n\ntype Comment @view {\n  body: String!\n  date: Int!\n  post: Post\n}\n',
            types: [],
          },
        },
      ],
      db: {
        Post: [
          {
            id: 1,
            title: 'Lorem Ipsum',
            views: 254,
            user: { id: 123 },
            comments: [{ id: 1 }, { id: 2 }],
          },
          {
            id: 2,
            title: 'Sic Dolor amet',
            views: 65,
            user: { id: 456 },
            comments: [],
          },
        ],
        User: [
          { id: 123, name: 'John Doe' },
          { id: 456, name: 'Jane Doe' },
        ],
        Comment: [
          {
            id: 987,
            post: { id: 1 },
            body: 'Consectetur adipiscing elit',
            date: 1639477614908,
          },
          {
            id: 995,
            post: { id: 1 },
            body: 'Nam molestie pellentesque dui',
            date: 1639477614908,
          },
        ],
      },
    },
    {
      externalId: 'demo',
      name: 'demo',
      description: 'demo',
      metadata: {},
      createdTime: 1625702400000,
      versions: [],
    },
  ],
} as MockData;
