/*!
 * Copyright 2023 Cognite AS
 */

// Lists a specific 360 image collections in the project
export const get360ImageCollectionsQuery = (externalId: string, space: string): string => `#graphql
  query get360ImageCollectionsQuery {
    getConnectionsImage360CollectionById(
    instance: {space: "${space}", externalId: "${externalId}"}
  ) {
      items {
        label
      }
      edges {
        node {
          entities {
            items {
              cubeMap {
                back
                bottom
                front
                left
                right
                top
              }
              translation {
                x
                y
                z
              }
              eulerRotation {
                x
                y
                z
              }
              label
              externalId
            }
          }
        }
      }
    }
  }
`;
