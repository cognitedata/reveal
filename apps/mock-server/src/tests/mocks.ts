export const execSchemaMock = `
    scalar JSONObject

          scalar Timestamp

          scalar Int64

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

          type Post {
              externalId: ID!
        title: String!
        views: Int!
        user: User
      }

      type User {
              externalId: ID!
        name: String!
      }

      type Comment {
              externalId: ID!
        body: String!
        date: Int!
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



              input _ListCommentFilter {
                body: _StringCondition
      date: _IntCondition
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
      date: _IntCondition
              }

              input _CommentSort {
                externalId: SortDirection
                body: SortDirection
      date: SortDirection
              }




          type PostConnection {
            edges: [_PostEdge]!
            items: [Post]!
            pageInfo: PageInfo!
          }

          type _PostEdge {
            node: Post
            cursor: String
          }


          type UserConnection {
            edges: [_UserEdge]!
            items: [User]!
            pageInfo: PageInfo!
          }

          type _UserEdge {
            node: User
            cursor: String
          }


          type CommentConnection {
            edges: [_CommentEdge]!
            items: [Comment]!
            pageInfo: PageInfo!
          }

          type _CommentEdge {
            node: Comment
            cursor: String
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
                query: String!
              ): PostConnection


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
                query: String!
              ): UserConnection


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
                query: String!
              ): CommentConnection


          }

            # we need to tell the server which types represent the root query
            # and root mutation types. We call them RootQuery and RootMutation by convention.
            schema {
              query: Query
            }
    `;
