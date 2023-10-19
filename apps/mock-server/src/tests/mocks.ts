export const execSchemaMock = `
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


    input _StringCondition {
      eq: String
      isNull: Boolean
      in: [String!]
      gt: String
      lt: String
      gte: String
      lte: String
      prefix: String
    }

    input _FloatCondition {
      eq: Float
      isNull: Boolean
      in: [Float!]
      gt: Float
      lt: Float
      gte: Float
      lte: Float
    }

    input _IDCondition {
      eq: ID
      isNull: Boolean
      in: [ID!]
    }

    input _Int64Condition {
      eq: Int64
      isNull: Boolean
      in: [Int64!]
      gt: Int64
      lt: Int64
      gte: Int64
      lte: Int64
    }

    input _IntCondition {
      eq: Int
      isNull: Boolean
      in: [Int!]
      gt: Int
      lt: Int
      gte: Int
      lte: Int
    }

    input _TimestampCondition {
      eq: Timestamp
      isNull: Boolean
      in: [Timestamp!]
      gt: Timestamp
      lt: Timestamp
      gte: Timestamp
      lte: Timestamp
    }

    enum SortDirection {
      ASC
      DESC
    }

    type PageInfo {
      hasNextPage: Boolean!
      hasPreviousPage: Boolean!
      startCursor: String
      endCursor: String
  }
    input InstanceRef {
      space: String!
      externalId: String!
  }




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

directive @unit(space: String, externalId: String) on FIELD_DEFINITION

"""
Specifies if a type will be used for representing edge properties
"""
directive @edge on OBJECT | INTERFACE


    
    type Post {
              externalId: ID!
              lastUpdatedTime: Timestamp!
              createdTime: Timestamp!
              space: String!
  title: String!
  views: Int!
  user: User
  comments(
                  first: Int
                  after: String
                  filter: _ListCommentFilter
                  sort: [_CommentSort!]
                  ): CommentConnection}

type User {
              externalId: ID!
              lastUpdatedTime: Timestamp!
              createdTime: Timestamp!
              space: String!
  name: String!
}

type Comment {
              externalId: ID!
              lastUpdatedTime: Timestamp!
              createdTime: Timestamp!
              space: String!
  body: String!
  date: Timestamp!
  post: Post
}

    
    
        input _ListPostFilter {
          title: _StringCondition
views: _IntCondition
          externalId: _IDCondition
          and: [_ListPostFilter!]
          or: [_ListPostFilter!]
          not: _ListPostFilter
        }

        enum _SearchPostFields {
          title
        }


        input _SearchPostFilter {
          externalId: _IDCondition
          and: [_SearchPostFilter!]
          or: [_SearchPostFilter!]
          not: _SearchPostFilter
          fields: [_SearchPostFields!]

          title: _StringCondition
views: _IntCondition
        }

        input _PostSort {
          externalId: SortDirection
          title: SortDirection
views: SortDirection
        }
        type _PostAggregateCountResult {
          externalId: Int!
        }
        type _PostAggregateFieldResult {
          views: Int!
        }

        

        input _ListUserFilter {
          name: _StringCondition
          externalId: _IDCondition
          and: [_ListUserFilter!]
          or: [_ListUserFilter!]
          not: _ListUserFilter
        }

        enum _SearchUserFields {
          name
        }


        input _SearchUserFilter {
          externalId: _IDCondition
          and: [_SearchUserFilter!]
          or: [_SearchUserFilter!]
          not: _SearchUserFilter
          fields: [_SearchUserFields!]

          name: _StringCondition
        }

        input _UserSort {
          externalId: SortDirection
          name: SortDirection
        }
        type _UserAggregateCountResult {
          externalId: Int!
        }
        type _UserAggregateFieldResult {
          _empty: Int!
        }

        

        input _ListCommentFilter {
          body: _StringCondition
date: _TimestampCondition
          externalId: _IDCondition
          and: [_ListCommentFilter!]
          or: [_ListCommentFilter!]
          not: _ListCommentFilter
        }

        enum _SearchCommentFields {
          body
        }


        input _SearchCommentFilter {
          externalId: _IDCondition
          and: [_SearchCommentFilter!]
          or: [_SearchCommentFilter!]
          not: _SearchCommentFilter
          fields: [_SearchCommentFields!]

          body: _StringCondition
date: _TimestampCondition
        }

        input _CommentSort {
          externalId: SortDirection
          body: SortDirection
date: SortDirection
        }
        type _CommentAggregateCountResult {
          externalId: Int!
        }
        type _CommentAggregateFieldResult {
          _empty: Int!
        }

        
    
    
    type PostConnection {
      edges: [_PostEdge]!
      items: [Post]!
      pageInfo: PageInfo!
    }

    type PostAggregateConnection {
      edges: [_PostAggregateEdge]!
      items: [PostAggregateResult]!
      pageInfo: PageInfo!
    }

    type _PostEdge {
      node: Post!
      cursor: String
    }

    type _PostAggregateEdge {
      node: PostAggregateResult!
      cursor: String
    }

    type PostAggregateResult {
      group: JSONObject
      avg: [_PostAggregateFieldResult]!
      min: [_PostAggregateFieldResult]!
      max: [_PostAggregateFieldResult]!
      count: _PostAggregateCountResult!
      sum: [_PostAggregateFieldResult]!
    }
    

    type UserConnection {
      edges: [_UserEdge]!
      items: [User]!
      pageInfo: PageInfo!
    }

    type UserAggregateConnection {
      edges: [_UserAggregateEdge]!
      items: [UserAggregateResult]!
      pageInfo: PageInfo!
    }

    type _UserEdge {
      node: User!
      cursor: String
    }

    type _UserAggregateEdge {
      node: UserAggregateResult!
      cursor: String
    }

    type UserAggregateResult {
      group: JSONObject
      avg: [_UserAggregateFieldResult]!
      min: [_UserAggregateFieldResult]!
      max: [_UserAggregateFieldResult]!
      count: _UserAggregateCountResult!
      sum: [_UserAggregateFieldResult]!
    }
    

    type CommentConnection {
      edges: [_CommentEdge]!
      items: [Comment]!
      pageInfo: PageInfo!
    }

    type CommentAggregateConnection {
      edges: [_CommentAggregateEdge]!
      items: [CommentAggregateResult]!
      pageInfo: PageInfo!
    }

    type _CommentEdge {
      node: Comment!
      cursor: String
    }

    type _CommentAggregateEdge {
      node: CommentAggregateResult!
      cursor: String
    }

    type CommentAggregateResult {
      group: JSONObject
      avg: [_CommentAggregateFieldResult]!
      min: [_CommentAggregateFieldResult]!
      max: [_CommentAggregateFieldResult]!
      count: _CommentAggregateCountResult!
      sum: [_CommentAggregateFieldResult]!
    }
    
    
    type Query {
      listPost(
          after: String
          filter: _ListPostFilter
          first: Int
          sort: [_PostSort!]
        ): PostConnection

        searchPost(
          fields: [_SearchPostFields!]

          filter: _SearchPostFilter
          first: Int
          after: String
          query: String!
        ): PostConnection

        getPostById(
          instance: InstanceRef!
        ): PostConnection

        aggregatePost(
          fields: [_SearchPostFields!]

          filter: _SearchPostFilter
          groupBy: [_SearchPostFields!]
          first: Int
          after: String
          query: String
        ): PostAggregateConnection

        
listUser(
          after: String
          filter: _ListUserFilter
          first: Int
          sort: [_UserSort!]
        ): UserConnection

        searchUser(
          fields: [_SearchUserFields!]

          filter: _SearchUserFilter
          first: Int
          after: String
          query: String!
        ): UserConnection

        getUserById(
          instance: InstanceRef!
        ): UserConnection

        aggregateUser(
          fields: [_SearchUserFields!]

          filter: _SearchUserFilter
          groupBy: [_SearchUserFields!]
          first: Int
          after: String
          query: String
        ): UserAggregateConnection

        
listComment(
          after: String
          filter: _ListCommentFilter
          first: Int
          sort: [_CommentSort!]
        ): CommentConnection

        searchComment(
          fields: [_SearchCommentFields!]

          filter: _SearchCommentFilter
          first: Int
          after: String
          query: String!
        ): CommentConnection

        getCommentById(
          instance: InstanceRef!
        ): CommentConnection

        aggregateComment(
          fields: [_SearchCommentFields!]

          filter: _SearchCommentFilter
          groupBy: [_SearchCommentFields!]
          first: Int
          after: String
          query: String
        ): CommentAggregateConnection

        
    }

      # we need to tell the server which types represent the root query
      # and root mutation types. We call them RootQuery and RootMutation by convention.
      schema {
        query: Query
      }
  `;
