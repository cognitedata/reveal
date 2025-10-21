/*!
 * Copyright 2025 Cognite AS
 */

const coreDmSpace = 'cdf_cdm';

/**
 * Creates a DMS query to fetch multiple 360 image collections in a single request.
 * This is much more efficient than making individual queries per collection.
 * 
 * @param collectionRefs - Array of collection identifiers to fetch
 * @returns DMS query that fetches all collections and their images in one request
 */
export function get360BatchCollectionQuery(
  collectionRefs: Array<{ externalId: string; space: string }>
) {
  // Create OR filter for multiple collections
  const collectionFilters = collectionRefs.map(ref => ({
    and: [
      {
        equals: {
          property: ['node', 'externalId'],
          value: ref.externalId
        }
      },
      {
        equals: {
          property: ['node', 'space'],
          value: ref.space
        }
      }
    ]
  }));

  return {
    with: {
      image_collections: {
        nodes: {
          filter: {
            or: collectionFilters
          }
        },
        limit: collectionRefs.length
      },
      images: {
        nodes: {
          from: 'image_collections',
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
        limit: 10000 * collectionRefs.length // Scale limit with number of collections
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
        limit: 10000 * collectionRefs.length
      }
    },
    select: {
      image_collections: {
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
}

