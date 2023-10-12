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

export const mixerApiCustomTypes = `
scalar Int32

"Represents a 64-bit integer value. Note that some consumers as JavaScript only supports [-(2^53)+1, (2^53)-1]."
scalar Int64

scalar Float32
scalar Float64

"Represents the number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds."
scalar Timestamp

"Represents a plain JSON object"
scalar JSONObject

scalar Date

type File {
  id: Int64
  externalId: String
  name: String
  directory: String
  source: String
  mimeType: String
  metadata: JSONObject
  assetIds: [Int64]
  dataSetId: Int64
  sourceCreatedTime: Timestamp
  sourceModifiedTime: Timestamp
  securityCategories: [Int64]
  labels: [String]
  geoLocation: _GeoLocation
  uploaded: Boolean
  uploadedTime: Timestamp
  downloadLink(extendedExpiration: Boolean): _DownloadLink
}

type _GeoLocation {
  type: String
  geometry: _GeoLocationGeometry
  properties: JSONObject
}

type _GeoLocationGeometry {
  type: _GeoLocationType
  coordinates: JSONObject
}

enum _GeoLocationType {
  Point
  LineString
  Polygon
  MultiPoint
  MultiLineString
  MultiPolygon
}

type _DownloadLink {
  downloadUrl: String
}

type DataPoint {
  timestamp: Timestamp
  value: DataPointValue
  average: Float64
  max: Float64
  min: Float64
  count: Int32
  sum: Float64
  interpolation: Float64
  stepInterpolation: Float64
  continuousVariance: Float64
  discreteVariance: Float64
  totalVariation: Float64
}

scalar DataPointValue


type Sequence {
  id: Int64
  externalId: String
  name: String
  description: String
  assetId: Int64
  dataSetId: Int64
  metadata: JSONObject
  columns: [_SequenceColumn]
  data(start: Int64, end: Int64, limit: Int, columns: [String]): _SequenceRow
  latest(before: Int64, columns: [String]): _SequenceRow
}


type _SequenceColumn {
  externalId: String
  name: String
  description: String
  metadata: JSONObject
  valueType: _SequenceColumnValueType
}

type _SequenceColumnInfo {
  externalId: String
  name: String
  valueType: _SequenceColumnValueType
}

enum _SequenceColumnValueType {
  DOUBLE
  STRING
  LONG
}

type _SequenceRow {
  id: Int64
  externalId: String
  columns: [_SequenceColumnInfo]
  rows: [_SequenceRowsData]
}

scalar _SequenceRowColumnValue

type _SequenceRowsData {
  rowNumber: Int64
  values: [_SequenceRowColumnValue]
}

type TimeSeries {
  id: Int64
  externalId: String
  name: String
  isString: Boolean
  metadata: JSONObject
  unit: String
  assetId: Int64
  isStep: Boolean
  description: String
  securityCategories: [Int64]
  datasetId: Int64
  dataPoints(
    start: Int64
    end: Int64
    limit: Int
    granularity: String
    aggregates: [_AggregateKind!]
  ): [DataPoint]
}


type _AggregateHistogramObjectType {
  start: Int
  count: Int
}

enum _AggregateKind {
  AVERAGE
  MAX
  MIN
  COUNT
  SUM
  INTERPOLATION
  STEP_INTERPOLATION
  CONTINUOUS_VARIANCE
  DISCRETE_VARIANCE
  TOTAL_VARIATION
}
`;

export const schemaServiceGraphqlApi = `
directive @specifiedBy(url: String!) on SCALAR

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

"Represents a plain JSON element. An Object, an array, a primitive."
scalar JSONElement


${mixerApiCustomTypes}

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
