/*!
 * Copyright 2025 Cognite AS
 */

import type { Query } from '../../../../types';

const coreDmSpace = 'cdf_cdm';

const Image360CollectionQueryBase = {
  with: {
    image_collections: {
      nodes: {
        filter: {
          or: []
        }
      },
      limit: 1
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
      limit: 10000
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
          identifier: 'station360',
          direction: 'outwards'
        }
      },
      limit: 10000
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
          properties: ['name'] as const
        }
      ] as const
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
          ] as const
        }
      ] as const
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
          properties: ['name'] as const
        }
      ] as const
    }
  }
} as const;

export type CdfImage360CollectionDmQuery = typeof Image360CollectionQueryBase;

/**
 * Creates a DMS query to fetch multiple 360 image collections in a single request.
 * This is much more efficient than making individual queries per collection.
 *
 * @param collectionRefs - Array of collection identifiers to fetch
 * @returns DMS query that fetches all collections and their images in one request
 */
export function get360CdmCollectionsQuery(collectionRefs: Array<{ externalId: string; space: string }>): Query {
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
              type: 'view',
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
              type: 'view',
              space: coreDmSpace,
              externalId: 'Cognite360Image',
              version: 'v1'
            },
            identifier: 'station360'
          },
          direction: 'outwards'
        },
        limit: 10000 // DMS API max limit
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
  };
}
