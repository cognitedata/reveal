import { generateConnectionTypes } from '../utils/graphql-schema-parser';

export const schemaServiceGraphqlApi = `
type Query {
  listApis(after: String, first: Int): ApiConnection
  getApisByIds(externalIds: [ID!]!): [Api]!

  validateBindings(apiExternalId: ID, version: Int!, bindings: [ViewBindingCreate!]!): [ValidationError!]!
}
type Mutation {
  upsertApis(apis: [ApiCreate!]!): [Api!]!
  deleteApis(externalIds: [ID!]!): [Api!]!
  upsertApiVersionFromGraphQl(apiVersion: ApiVersionFromGraphQl, conflictMode: ConflictMode = PATCH): ApiVersion
}

type Api {
  externalId: ID!
  name: String!
  description: String
  metadata: JSONObject
  createdTime: Timestamp!

  versions: [ApiVersion!]!
}
input ApiCreate {
  externalId: ID!
  name: String!
  description: String
  metadata: JSONObject
}

type ApiVersion {
  version: Int!
  dataModel: DataModel!
  createdTime: Timestamp!
  bindings: [ViewBinding!]!
  api: Api
}

input ApiVersionFromGraphQl {
  "Optional version to upsert"
  version: Int
  "ExternalId of the api"
  apiExternalId: ID!
  graphQl: String!
  bindings: [ViewBindingCreate!]
  metadata: JSONObject
}

enum ConflictMode {
  "This mode tries to patch the existing data model and fails if there are breaking changes"
  PATCH
  "This mode creates a new version"
  NEW_VERSION
}

type DataModel {
  types: [Type!]!
  graphqlRepresentation: String!
}
type Type {
  name: String!
  fields: [Field!]!
  view: View
  comments: [String!]!
}
type Field {
  name: String!
  type: String!
  repeatable: Boolean!
  constraints: FieldConstraints!
  comments: [String!]!
}
type FieldConstraints {
  isId: Boolean!
  nonNull: Boolean!
}
type View {
  kind: ViewKind!
}
enum ViewKind {
  READ_ONLY
  TABLE
}
type ViewBinding {
  targetName: String!
  dataSource: DataSource
}
input ViewBindingCreate {
  targetName: String!
  dataModelStorageSource: DataModelStorageSourceCreate
  noopDataSource: NoopDataSourceCreate
}
union DataSource = DataModelStorageSource | NoopDataSource

type DataModelStorageSource {
  externalId: String
  space: String
  mappings: [Mapping!]!
}
input DataModelStorageSourceCreate {
  space: String!
  externalId: String!
  mappings: [MappingCreate!]
}

type NoopDataSource {
  _dummy: String
}

input NoopDataSourceCreate {
  _dummy: String
}
input MappingCreate {
  fieldName: String!
  reverseRelation: MappingReverseRelationCreate!
}
type Mapping {
  fieldName: String!
  reverseRelation: MappingReverseRelation!
}
input MappingReverseRelationCreate {
  fieldName: String!
}
type MappingReverseRelation {
  fieldName: String!
}

type ValidationError {
  message: String!
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
"Represents a plain JSON object"
scalar JSONObject

"Represents a plain JSON element. An Object, an array, a primitive."
scalar JSONElement

"Represents the number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds."
scalar Timestamp

"Represents a 64-bit integer value. Note that some consumers as JavaScript only supports [-(2^53)+1, (2^53)-1]."
scalar Int64

${generateConnectionTypes('Api')}
`;
