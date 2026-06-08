/*!
 * Copyright 2025 Cognite AS
 */

import {
  COGNITE_360_IMAGE_COLLECTION_SOURCE,
  COGNITE_360_IMAGE_SOURCE,
  COGNITE_360_IMAGE_STATION_SOURCE,
  MAX_DMS_QUERY_LIMIT
} from '../../../../utilities/constants';
import type { DMInstanceRef } from '@reveal/utilities';
import { CORE_DM_IMAGE_360_PROPERTIES_LIST } from '../../../cdm/queryProperties';

function createCollectionsQuery(instanceReferences: DMInstanceRef[]): {
    with: {
        image_collections: {
            nodes: {
                filter: {
                    instanceReferences: DMInstanceRef[];
                };
            };
            limit: number;
        };
        images: {
            nodes: {
                from: string;
                through: {
                    view: {
                        readonly externalId: "Cognite360Image";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    identifier: string;
                };
            };
            limit: number;
        };
        stations: {
            nodes: {
                from: string;
                through: {
                    view: {
                        readonly externalId: "Cognite360Image";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    identifier: string;
                };
                direction: "outwards";
            };
            limit: number;
        };
    }; select: {
        image_collections: {
            sources: {
                source: {
                    readonly externalId: "Cognite360ImageCollection";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                properties: string[];
            }[];
        };
        images: {
            sources: {
                source: {
                    readonly externalId: "Cognite360Image";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                properties: ["translationX", "translationY", "translationZ", "eulerRotationX", "eulerRotationY", "eulerRotationZ", "scaleX", "scaleY", "scaleZ", "front", "back", "left", "right", "top", "bottom", "collection360", "station360", "takenAt"];
            }[];
        };
        stations: {
            sources: {
                source: {
                    readonly externalId: "Cognite360ImageStation";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                    readonly type: "view";
                };
                properties: string[];
            }[];
        };
    };
} {
  return {
    with: {
      image_collections: {
        nodes: {
          filter: {
            instanceReferences
          }
        },
        limit: instanceReferences.length
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
