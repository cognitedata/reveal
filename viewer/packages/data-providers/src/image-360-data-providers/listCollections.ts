/*!
 * Copyright 2023 Cognite AS
 */
export const listAll360ImageCollectionsQuery = `#graphql
  query listAll360ImageCollectionsQuery {
    listConnectionsImage360Collection {
      edges {
        node {
          entities {
            items {
              label
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
              cubeMap {
                back
                bottom
                front
                left
                right
                top
              }
              externalId
            }
          }
          label
          externalId
        }
      }
    }
  }
`;
