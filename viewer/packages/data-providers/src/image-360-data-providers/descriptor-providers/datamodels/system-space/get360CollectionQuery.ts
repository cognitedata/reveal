/*!
 * Copyright 2023 Cognite AS
 */

const cdf360ImageSchemaSpace = 'cdf_360_image_schema';

const Image360CollectionQuery = {
  with: {
    image_collection: {
      nodes: {
        filter: {
          and: [
            {
              equals: {
                property: ['node', 'externalId'],
                value: { parameter: 'collectionExternalId' }
              }
            },
            {
              equals: {
                property: ['node', 'space'],
                value: { parameter: 'collectionSpace' }
              }
            }
          ]
        }
      },
      limit: 1
    },
    images: {
      nodes: {
        from: 'image_collection',
        through: {
          view: {
            type: 'view',
            space: cdf360ImageSchemaSpace,
            externalId: 'Image360',
            version: 'v1'
          },
          identifier: 'collection360'
        }
      },
      limit: 10000
    },
    stations: {
      nodes: {
        from: 'images',
        through: {
          view: {
            type: 'view',
            space: cdf360ImageSchemaSpace,
            externalId: 'Image360',
            version: 'v1'
          },
          identifier: 'station'
        },
        direction: 'outwards'
      },
      limit: 10000
    }
  },
  select: {
    image_collection: {
      sources: [
        {
          source: {
            type: 'view',
            space: cdf360ImageSchemaSpace,
            externalId: 'Image360Collection',
            version: 'v1'
          },
          properties: ['label']
        }
      ]
    },
    images: {
      sources: [
        {
          source: {
            type: 'view',
            space: cdf360ImageSchemaSpace,
            externalId: 'Image360',
            version: 'v1'
          },
          properties: [
            'translationX',
            'translationY',
            'translationZ',
            'eulerRotationX',
            'eulerRotationY',
            'eulerRotationZ',
            'scaleX',
            'scaleY',
            'scaleZ',
            'cubeMapFront',
            'cubeMapBack',
            'cubeMapLeft',
            'cubeMapRight',
            'cubeMapTop',
            'cubeMapBottom',
            'collection360',
            'station',
            'timeTaken',
            'label'
          ]
        }
      ]
    },
    stations: {
      sources: [
        {
          source: {
            type: 'view',
            space: cdf360ImageSchemaSpace,
            externalId: 'Station360',
            version: 'v1'
          },
          properties: ['label']
        }
      ]
    }
  }
} as const;

export type Cdf360FdmQuery = typeof Image360CollectionQuery;

export function get360CollectionQuery(
  externalId: string,
  space: string
): Cdf360FdmQuery & { parameters: { collectionExternalId: string; collectionSpace: string } } {
  return { ...Image360CollectionQuery, parameters: { collectionExternalId: externalId, collectionSpace: space } };
}
