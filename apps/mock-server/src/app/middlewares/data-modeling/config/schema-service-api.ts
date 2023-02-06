export const mixerApiV3CustomDirectives = `

"""
Specifies that a type is a view type.

* space: Overrides the space, which by default is the same as the data model.
* name: Overrides the name of the view, which by default is the same as the externalId.
* version: Overrides the version of the view, which by default is the same as the data model version.
"""
directive @view(space: String, name: String, version: String) on OBJECT | INTERFACE

"""
Overrides the mapping of a field. Can only be used in a view type and can not be used on derived fields.

* space: Overrides the space, which by default is the same as the data model space.
* container: Overrides the container externalId, which by default is the same as the externalId of the view postfixed with 'Container'.
* property: Overrides the container property identifier being mapped.
"""
directive @mapping(space: String, container: String, property: String) on FIELD_DEFINITION

input _DirectRelationRef {
  space: String!
  externalId: String!
}

enum _RelationDirection {
  INWARDS
  OUTWARDS
}

"""
Defines the relation field's details

* name: Overrides the name property of the relation definition. This is merely metadata, and should not be confused with the property identifier!
* direction: The direction to follow the edges filtered by 'type'.
* type: Specifies the edge type, namespaced by 'space', where the 'externalId' corresponds to the edge type name.
"""
directive @relation(
  type: _DirectRelationRef!
  name: String
  direction: _RelationDirection
) on FIELD_DEFINITION
`;

export const schemaServiceGraphqlApi = `
directive @specifiedBy(url: String!) on SCALAR
type Api {
  externalId: ID!
  name: String!
  description: String
  metadata: JSONObject
  createdTime: Timestamp!
  versions: [ApiVersion!]!
}

type ApiConnection {
  edges: [ApiEdge]!
  items: [Api]!
  pageInfo: PageInfo!
}

input ApiCreate {
  externalId: ID!
  name: String!
  description: String
  metadata: JSONObject
}

type ApiEdge {
  node: Api!
  cursor: String!
}

type ApiVersion {
  version: Int!
  dataModel: DataModel!
  createdTime: Timestamp!
  bindings: [ViewBinding!]!
  api: Api
}

input ApiVersionFromGraphQl {
  version: Int
  apiExternalId: ID!
  graphQl: String!
  bindings: [ViewBindingCreate!]
  metadata: JSONObject
}

type BreakingChangeInfo {
  typeOfChange: TypeOfChange!
  typeName: String
  fieldName: String
  previousValue: String
  currentValue: String
}

enum ConflictMode {
  PATCH
  NEW_VERSION
}

type Connection {
  connection: ConnectionData!
}

input ConnectionCreate {
  edgeFilter: MappingFilter
  nodeFilter: MappingFilter
  outwards: Boolean
  maxHops: Int
}

type ConnectionData {
  edgeFilter: JSONObject
  nodeFilter: JSONObject
  outwards: Boolean
  maxHops: Int
}

input ContainsAllFilter {
  property: [String!]!
  values: [JSONElement!]!
}

input ContainsAnyFilter {
  property: [String!]!
  values: [JSONElement!]!
}

type DataModel {
  types: [Type!]!
  graphqlRepresentation: String!
}

type DataModelStorageMappingSource {
  filter: JSONObject
  properties: [MappingProperty!]
}

input DataModelStorageMappingSourceCreate {
  filter: MappingFilter
  properties: [MappingPropertyCreate!]
}

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

union DataSource =
    DataModelStorageSource
  | DataModelStorageMappingSource
  | NoopDataSource
input EqualsFilter {
  property: [String!]!
  value: JSONElement!
}

input ExistsFilter {
  property: [String!]!
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

input HasDataFilter {
  models: [[String!]!]!
}

input InFilter {
  property: [String!]!
  values: [JSONElement!]!
}

scalar JSONElement

scalar JSONObject

type Mapping {
  fieldName: String!
  reverseRelation: MappingReverseRelation!
}

input MappingCreate {
  fieldName: String!
  reverseRelation: MappingReverseRelationCreate!
}

input MappingFilter {
  and: [MappingFilter!]
  or: [MappingFilter!]
  not: [MappingFilter!]
  equals: EqualsFilter
  in: InFilter
  range: RangeFilter
  prefix: PrefixFilter
  exists: ExistsFilter
  containsAny: ContainsAnyFilter
  containsAll: ContainsAllFilter
  hasData: HasDataFilter
}

type MappingProperty {
  from: PropertySource
  as: String
}

input MappingPropertyCreate {
  from: PropertySourceCreate
  as: String
}

type MappingReverseRelation {
  fieldName: String!
}

input MappingReverseRelationCreate {
  fieldName: String!
}

type Mutation {
  upsertApis(apis: [ApiCreate!]!): [Api!]!
  deleteApis(externalIds: [ID!]!): [Api!]!
  upsertApiVersionFromGraphQl(
    apiVersion: ApiVersionFromGraphQl
    conflictMode: ConflictMode = PATCH
  ): ApiVersion
  upsertGraphQlDmlVersion(graphQlDmlVersion: GraphQlDmlVersionUpsert!): UpsertGraphQlDmlVersionResult!
}

type NoopDataSource {
  _dummy: String
}

input NoopDataSourceCreate {
  _dummy: String
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

input PrefixFilter {
  property: [String!]!
  value: JSONElement!
}

type Property {
  property: [String!]
}

union PropertySource = Property | Union | ReverseLink | Connection
input PropertySourceCreate {
  property: [String!]
  union: [[String!]!]
  reverseLink: [String!]
  connection: ConnectionCreate
}

type Query {
  listApis(after: String, first: Int): ApiConnection
  getApisByIds(externalIds: [ID!]!): [Api]!
  validateBindings(
    apiExternalId: ID
    version: Int!
    bindings: [ViewBindingCreate!]!
  ): [ValidationError!]!
  validateApiVersionFromGraphQl(
    apiVersion: ApiVersionFromGraphQl
    conflictMode: ConflictMode = PATCH
  ): [ValidationError!]!
  queryStatistics(
    queries: [QueryStatistic!]!
    since: Timestamp
    until: Timestamp
  ): [Statistic]
  listGraphQlDmlVersions(limit: Int, cursor: String): GraphQlDmlVersionConnection
  graphQlDmlVersionsById(space: String!, externalId: String!): GraphQlDmlVersionConnection
}

input QueryStatistic {
  query: String!
}

input RangeFilter {
  property: [String!]!
  gte: JSONElement!
  gt: JSONElement!
  lte: JSONElement!
  lt: JSONElement!
}

type ReverseLink {
  reverseLink: [String!]
}

type Statistic {
  query: String!
  count: Int
}

scalar Timestamp

type Type {
  name: String!
  fields: [Field!]!
  view: View
  comments: [String!]!
}

enum TypeOfChange {
  TYPE_REMOVED
  FIELD_REMOVED
  FIELD_TYPE_CHANGED
  CONSTRAINT_CHANGED
}

type Union {
  union: [[String!]!]
}

type ValidationError {
  message: String!
  breakingChangeInfo: BreakingChangeInfo
}

type View {
  kind: ViewKind!
}

type ViewBinding {
  targetName: String!
  dataSource: DataSource
}

input ViewBindingCreate {
  targetName: String!
  dataModelStorageSource: DataModelStorageSourceCreate
  dataModelStorageMappingSource: DataModelStorageMappingSourceCreate
  noopDataSource: NoopDataSourceCreate
}

enum ViewKind {
  READ_ONLY
  TABLE
}

"Represents a plain JSON object"
scalar JSONObject

"Represents a plain JSON element. An Object, an array, a primitive."
scalar JSONElement

"Represents the number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds."
scalar Timestamp

"Represents a 64-bit integer value. Note that some consumers as JavaScript only supports [-(2^53)+1, (2^53)-1]."
scalar Int64

${mixerApiV3CustomDirectives}


type UpsertGraphQlDmlVersionResult {
  errors: [Error!]
  result: GraphQlDmlVersion
}

type GraphQlDmlVersion {
  space: String!
  externalId: String!
  version: String!

  name: String
  description: String

  graphQlDml: String

  createdTime: Timestamp
  lastUpdatedTime: Timestamp
}

type GraphQlDmlVersionConnection {
  edges: [GraphQlDmlVersionEdge]!
  items: [GraphQlDmlVersion]!
  pageInfo: PageInfo!
}

type GraphQlDmlVersionEdge {
  node: GraphQlDmlVersion!
  cursor: String!
}

input GraphQlDmlVersionUpsert {
  space: String!
  externalId: String!
  version: String!

  name: String
  description: String

  graphQlDml: String
}

input GraphQlDmlVersionFilter {
  externalId: StringFilter
}

input StringFilter {
  eq: String
  in: [String!]
}

input GraphQlDmlVersionSort {
  createdTime: SortOrder
}

enum SortOrder {
  ASCENDING
  DESCENDING
}

type Error {
  message: String!
  location: SourceLocationRange!
}

type SourceLocationRange {
  start: SourceLocation!
  end: SourceLocation!
}

type SourceLocation {
  "1 indexed"
  line: Int!

  "1 indexed"
  column: Int!

  "Character offset in to the source file"
  offset: Int
}
`;
