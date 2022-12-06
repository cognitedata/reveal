export const fdmDataModelsMockData = [
  {
    space: 'blog',
    externalId: 'blog',
    id: 'blog',
    name: 'blog',
    description: 'blog',
    version: '1',
    metadata: {
      graphQlDml:
        'type Post {\n  title: String!\n  views: Int!\n  user: User\n tags: [String]\n comments: [Comment]\n}\n\ntype User {\n  name: String!\n}\n\ntype Comment {\n  body: String!\n  date: Timestamp!\n  post: Post\n}\n\ntype TypeWithoutData {\n  name: String!\n}',
    },
    createdTime: 1625702400000,
    lastUpdatedTime: 1625702400000,
  },
  {
    space: 'blog',
    externalId: 'blog',
    id: 'blog2',
    name: 'blog2',
    description: 'blog',
    version: '2',
    metadata: {
      graphQlDml:
        'type Post {\n  title: String!\n  views: Int!\n  user: UserType\n tags: [String]\n comments: [Comment]\n}\n\ntype UserType {\n  name: String!\n}\n\ntype Comment {\n  body: String!\n  date: Timestamp!\n  post: Post\n}\n\ntype TypeWithoutData {\n  name: String!\n}',
    },
    createdTime: 1625702400001,
    lastUpdatedTime: 1625702400004,
  },
];
