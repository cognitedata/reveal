/*!
 * Copyright 2023 Cognite AS
 */

// Lists a specific 360 image collections in the project
export const get360ImageCollectionsQuery = (externalId: string, space: string): string => `#graphql
  query MyQuery {
    getImage360CollectionById(instance: {space: "${space}", externalId: "${externalId}"}) {
      items {
        stations(first: 1000) {
          items {
            revisions(first: 1000) {
              items {
                externalId
                label
                cubeMap {
                  back {
                    id
                    mimeType
                  }
                  bottom {
                    id
                    mimeType
                  }
                  front {
                    id
                    mimeType
                  }
                  left {
                    id
                    mimeType
                  }
                  right {
                    id
                    mimeType
                  }
                  top {
                    id
                    mimeType
                  }
                }
                eulerRotation {
                  x
                  y
                  z
                }
                translation {
                  x
                  y
                  z
                }
              }
            }
            label
            externalId
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
        label
        externalId
      }
    }
  }
`;
