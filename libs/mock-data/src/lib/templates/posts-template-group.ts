export const postsGraphQlSchema = `
type Post @template {
  id: Int!
  title: String!
  views: Int!
  user: User
  tags: [String]
  metadata: PostMetadata
  colors: [PostColor]
  comments: [Comment]
}

type User @template {
  id: Int!
  name: String!
}

type Comment @template {
  id: Int!
  body: String!
  date: Int!
  post: Post
}

type PostMetadata {
  slug: String
}

type PostColor {
  name: String
}

type Like {
  id: Int
  user: User
  comment: Comment
}
`;

export const postsTemplateGroup = {
  version: 1,
  createdTime: 1639476522639,
  lastUpdatedTime: 1639477614908,
  templategroups_id: 'posts-example',
  externalId: 'posts-example',
  schema: postsGraphQlSchema,
  db: {
    Post: [
      {
        id: 1,
        title: 'Lorem Ipsum',
        views: 254,
        user: { id: 123 },
        tags: ['Lorem', 'Ipsum'],
        metadata: { slug: 'lorem-ipsum' },
        colors: [{ name: 'red' }],
        comments: [{ id: 987 }, { id: 995 }],
      },
      {
        id: 2,
        title: 'Sic Dolor amet',
        views: 65,
        user: { id: 456 },
        tags: ['Sic', 'Dolor'],
        metadata: { slug: 'sic-dolor-amet' },
        colors: [{ name: 'blue' }],
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
};
