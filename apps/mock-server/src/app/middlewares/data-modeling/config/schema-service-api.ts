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
* edgeSource: Specifies the GraphQL type which defines the edge properties to be stored for this relation
"""
directive @relation(
  type: _DirectRelationRef
  name: String
  direction: _RelationDirection
  edgeSource: String
) on FIELD_DEFINITION

"""
Specifies that the view can be readonly, which means it's not writable.
The view can then omit mapping required properties of a container.
"""
directive @readonly on OBJECT | INTERFACE

input _DataModelRef {
  space: String!
  externalId: String!
  version: String!
}

"""
Specifies that the view is imported, which means the view definition needs to already exist.
The imported view can omit fields, and container directives.
"""
directive @import(dataModel: _DataModelRef) on OBJECT | INTERFACE

directive @default(value: String) on FIELD_DEFINITION


"""
Specifies if a type will be used for representing edge properties
"""
directive @edge on OBJECT | INTERFACE
`;

export const schemaServiceGraphqlApi = `
directive @specifiedBy(url: String!) on SCALAR

scalar JSONElement

scalar JSONObject

type Mutation {
  upsertGraphQlDmlVersion(graphQlDmlVersion: GraphQlDmlVersionUpsert!): UpsertGraphQlDmlVersionResult!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Query {
  listGraphQlDmlVersions(limit: Int, cursor: String): GraphQlDmlVersionConnection
  graphQlDmlVersionsById(space: String!, externalId: String!): GraphQlDmlVersionConnection
}

scalar Timestamp

"Represents a plain JSON object"
scalar JSONObject

"Represents a plain JSON element. An Object, an array, a primitive."
scalar JSONElement

"Represents the number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds."
scalar Timestamp

"Represents a 64-bit integer value. Note that some consumers as JavaScript only supports [-(2^53)+1, (2^53)-1]."
scalar Int64

${mixerApiV3CustomDirectives}

type Views {
  externalId: String!
  version: String
}

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
  views: [Views]
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
  previousVersion: String

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

enum ErrorKind {
  COMPILE_ERROR
  DIFF_ERROR
}

type Error {
  message: String!
  kind: ErrorKind!
  hint: String
  location: SourceLocationRange!
}

type SourceLocationRange {
  start: SourceLocation!
  end: SourceLocation
}

type SourceLocation {
  "1 indexed"
  line: Int!

  "1 indexed"
  column: Int!
}
`;
