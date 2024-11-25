/*!
 * Copyright 2023 Cognite AS
 */

const coreDmSpace = 'cdf_cdm';

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
            space: coreDmSpace,
            externalId: 'Cognite360Image',
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
            space: coreDmSpace,
            externalId: 'Cognite360Image',
            version: 'v1'
          },
          identifier: 'station360'
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
            space: coreDmSpace,
            externalId: 'Cognite360ImageCollection',
            version: 'v1'
          },
          properties: ['name']
        }
      ]
    },
    images: {
      sources: [
        {
          source: {
            type: 'view',
            space: coreDmSpace,
            externalId: 'Cognite360Image',
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
            'front',
            'back',
            'left',
            'right',
            'top',
            'bottom',
            'collection360',
            'station360',
            'takenAt'
          ]
        }
      ]
    },
    stations: {
      sources: [
        {
          source: {
            type: 'view',
            space: coreDmSpace,
            externalId: 'Cognite360ImageStation',
            version: 'v1'
          },
          properties: ['name']
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
