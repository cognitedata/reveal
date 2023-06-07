export const fdmContainersMockData = [
  {
    space: 'blog',
    name: 'Post',
    description: 'The Container for Post',
    externalId: 'PostTable',
    id: 'PostTable',
    usedFor: 'node',
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
    space: 'blog',
    name: 'User',
    description: 'The Container for User',
    externalId: 'UserTable',
    id: 'UserTable',
    usedFor: 'node',
    properties: {
      name: {
        type: 'text',
        nullable: false,
      },
    },
  },
  {
    space: 'blog',
    name: 'Comment',
    description: 'The Container for Comment',
    externalId: 'CommentTable',
    id: 'CommentTable',
    usedFor: 'node',
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
  {
    space: 'blog',
    name: 'Post_Comments_Edge',
    description: 'The Edge for connecting Posts and Comments',
    externalId: 'Post_Comments_Edge',
    id: 'Post_Comments_Edge',
    usedFor: 'edge',
    properties: {
      dummy: {
        type: 'text',
        nullable: true,
      },
    },
  },
];
