/*!
 * Copyright 2025 Cognite AS
 */

const coreDmSpace = 'cdf_cdm';

function createCollectionsQuery(collectionRefs: Array<{ externalId: string; space: string }>) {
  // Create OR filter for multiple collections
  const collectionFilters = collectionRefs.map(ref => ({
    and: [
      {
        equals: {
          property: ['node', 'externalId'] as const,
          value: ref.externalId
        }
      },
      {
        equals: {
          property: ['node', 'space'] as const,
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
              type: 'view' as const,
              space: coreDmSpace,
              externalId: 'Cognite360Image',
              version: 'v1'
            },
            identifier: 'collection360'
          }
        },
        limit: 10000 // DMS API max limit
      },
      stations: {
        nodes: {
          from: 'images',
          through: {
            view: {
              type: 'view' as const,
              space: coreDmSpace,
              externalId: 'Cognite360Image',
              version: 'v1'
            },
            identifier: 'station360'
          },
          direction: 'outwards' as const
        },
        limit: 10000 // DMS API max limit
      }
    },
    select: {
      image_collections: {
        sources: [
          {
            source: {
              type: 'view' as const,
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
              type: 'view' as const,
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
              type: 'view' as const,
              space: coreDmSpace,
              externalId: 'Cognite360ImageStation',
              version: 'v1'
            },
            properties: ['name']
          }
        ]
      }
    }
  };
}

// Derive the detailed query type from the helper function's inferred return type
export type CdfImage360CollectionDmQuery = ReturnType<typeof createCollectionsQuery>;

/**
 * Creates a DMS query to fetch multiple 360 image collections in a single request.
 * This is much more efficient than making individual queries per collection.
 *
 * @param collectionRefs - Array of collection identifiers to fetch
 * @returns DMS query that fetches all collections and their images in one request
 */
export function get360CdmCollectionsQuery(
  collectionRefs: Array<{ externalId: string; space: string }>
): CdfImage360CollectionDmQuery {
  return createCollectionsQuery(collectionRefs);
}
