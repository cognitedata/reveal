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
  {
    space: 'test-space',
    externalId: 'test',
    id: 'test',
    name: 'test',
    description: 'test',
    version: '1-alpha',
    metadata: {
      graphQlDml:
        'interface Describable {\n  name: String\n  description: String\n}\n\ninterface Assignable {\n  assignedTo: String\n}\n\n\ninterface UserName {\n    """\n    The name of the User.\n    """\n    name: String!\n}\n\n\ntype Person implements Describable & Assignable & UserName @view {\n  """\n  The id of the Person.\n  """\n  id: ID!\n  name: String!\n  description: String\n  assignedTo: String\n  mappedField: String @mapping(container:"Test", property: "field")\n  ownedField: Int\n  posts: [Post]\n}\n\ntype Post {\n  id: ID!\n  body: String!\n  author: Person\n}\n\n',
    },
    createdTime: 1625702400001,
    lastUpdatedTime: 1625702400004,
  },
];
