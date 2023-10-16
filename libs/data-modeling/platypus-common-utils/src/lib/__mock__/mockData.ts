export const graphQlSchemaMock = `
type Post @view {
  id: Int!
  title: String!
  views: Int!
  user: User
  tags: [String]
  metadata: PostMetadata
  colors: [PostColor]
  comments: [Comment]
}
type User @view {
  id: Int!
  name: String!
}
type Comment @view {
  id: Int!
  body: String!
  date: Int!
  post: Post
}
type PostMetadata {
  slug: String
}
interface PostColor {
  name: String
}
type Like {
  id: Int
  user: User
  comment: Comment
}

interface UserType @view(version: "1", space: "Blog") @import {
  name: String!
}

type AuthorAddress {
  street: String
}

interface Author implements UserType {
	name: String!
  contact: String
  address: [AuthorAddress] @relation(edgeSource: "AuthorAddress")
}
`;
