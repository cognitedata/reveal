/*!
 * Copyright 2025 Cognite AS
 */

import {
  COGNITE_360_IMAGE_COLLECTION_SOURCE,
  COGNITE_360_IMAGE_SOURCE,
  COGNITE_360_IMAGE_STATION_SOURCE,
  MAX_DMS_QUERY_LIMIT
} from '../../../../utilities/constants';
import { DMInstanceRef } from '@reveal/utilities';
import { CORE_DM_IMAGE_360_PROPERTIES_LIST } from '../../../cdm/queryProperties';

function createCollectionsQuery(collectionRefs: DMInstanceRef[]) {
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
            view: COGNITE_360_IMAGE_SOURCE,
            identifier: 'collection360'
          }
        },
        limit: MAX_DMS_QUERY_LIMIT
      },
      stations: {
        nodes: {
          from: 'images',
          through: {
            view: COGNITE_360_IMAGE_SOURCE,
            identifier: 'station360'
          },
          direction: 'outwards' as const
        },
        limit: MAX_DMS_QUERY_LIMIT
      }
    },
    select: {
      image_collections: {
        sources: [
          {
            source: COGNITE_360_IMAGE_COLLECTION_SOURCE,
            properties: ['name']
          }
        ]
      },
      images: {
        sources: [
          {
            source: COGNITE_360_IMAGE_SOURCE,
            properties: CORE_DM_IMAGE_360_PROPERTIES_LIST
          }
        ]
      },
      stations: {
        sources: [
          {
            source: COGNITE_360_IMAGE_STATION_SOURCE,
            properties: ['name']
          }
        ]
      }
    }
  };
}

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
