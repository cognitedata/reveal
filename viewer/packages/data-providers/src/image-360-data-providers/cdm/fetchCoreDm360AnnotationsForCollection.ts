/*!
 * Copyright 2025 Cognite AS
 */
import type { CogniteClient, QueryRequest, TableExpressionEqualsFilterV3 } from '@cognite/sdk';
import { getNodeExternalIdEqualsFilter, getNodeSpaceEqualsFilter } from '../../utilities/utils';
import { isCoreDmImage360CollectionFilter } from './queryFilters';
import { queryNodesAndEdges } from './queryNodesAndEdges';
import {
  ASSET_SIMPLE_PROPERTIES_LIST,
  CORE_DM_IMAGE_360_ANNOTATIONS_PROPERTIES_LIST,
  CORE_DM_IMAGE_360_PROPERTIES_LIST
} from './queryProperties';
import {
  COGNITE_ASSET_VIEW_REFERENCE,
  CORE_DM_IMAGE_360_ANNOTATION_VIEW_REFERENCE,
  CORE_DM_IMAGE_360_VIEW_REFERENCE
} from './sources';
import { transformAnnotations } from './transformCdmAnnotations';
import type { CoreDmImage360Annotation, Image360AnnotationViewReferenceAndProperties } from './types';
import type { DMInstanceRef } from '@reveal/utilities';

export async function fetchCoreDm360AnnotationsForCollection(
  collectionIdentifier: DMInstanceRef,
  sdk: CogniteClient
): Promise<CoreDmImage360Annotation[]> {
  const query = getImage360AnnotationsQuery(collectionIdentifier);

  const selectFunction = (result: GetImage360AnnotationsFromCollectionResponse) => transformAnnotations(result);

  const result = await queryNodesAndEdges<
    ReturnType<typeof getImage360AnnotationsQuery>,
    Image360AnnotationViewReferenceAndProperties
  >(query, sdk);

  return selectFunction(result);
}

export type GetImage360AnnotationsFromCollectionResponse = Awaited<
  ReturnType<
    typeof queryNodesAndEdges<
      ReturnType<typeof getImage360AnnotationsQuery>,
      Image360AnnotationViewReferenceAndProperties
    >
  >
>;

function getImage360AnnotationsQuery(collectionReference: DMInstanceRef): {
    readonly with: {
        readonly collection: {
            readonly nodes: {
                readonly filter: {
                    readonly and: [{
                        readonly and: [{
                            hasData: {
                                readonly type: "view";
                                readonly space: "cdf_cdm";
                                readonly externalId: "Cognite3DRevision";
                                readonly version: "v1";
                            }[];
                        }, {
                            readonly equals: {
                                readonly property: ["cdf_cdm_3d", "Cognite3DRevision", "type"];
                                readonly value: "Image360";
                            };
                        }];
                    }, TableExpressionEqualsFilterV3, TableExpressionEqualsFilterV3];
                };
            };
        };
        readonly images: {
            readonly nodes: {
                readonly from: "collection";
                readonly through: {
                    readonly view: {
                        readonly type: "view";
                        readonly space: "cdf_cdm";
                        readonly externalId: "Cognite360Image";
                        readonly version: "v1";
                    };
                    readonly identifier: "collection360";
                };
                readonly direction: "inwards";
            };
            readonly limit: 10000;
        };
        readonly annotations: {
            readonly edges: {
                readonly from: "images";
                readonly direction: "inwards";
                readonly filter: {
                    readonly and: [{
                        readonly hasData: [{
                            readonly type: "view";
                            readonly space: "cdf_cdm";
                            readonly externalId: "Cognite360ImageAnnotation";
                            readonly version: "v1";
                        }];
                    }];
                };
            };
            readonly limit: 10000;
        };
        readonly object3d: {
            readonly nodes: {
                readonly from: "annotations";
            };
            readonly limit: 10000;
        };
        readonly assets: {
            readonly nodes: {
                readonly from: "object3d";
                readonly through: {
                    readonly view: {
                        readonly type: "view";
                        readonly externalId: "CogniteAsset";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                    };
                    readonly identifier: "object3D";
                };
            };
            readonly limit: 10000;
        };
    }; readonly select: {
        readonly collection: {};
        readonly images: {
            readonly sources: [{
                readonly source: {
                    readonly type: "view";
                    readonly space: "cdf_cdm";
                    readonly externalId: "Cognite360Image";
                    readonly version: "v1";
                };
                readonly properties: ["translationX", "translationY", "translationZ", "eulerRotationX", "eulerRotationY", "eulerRotationZ", "scaleX", "scaleY", "scaleZ", "front", "back", "left", "right", "top", "bottom", "collection360", "station360", "takenAt"];
            }];
        };
        readonly annotations: {
            readonly sources: [{
                readonly source: {
                    readonly type: "view";
                    readonly space: "cdf_cdm";
                    readonly externalId: "Cognite360ImageAnnotation";
                    readonly version: "v1";
                };
                readonly properties: ["polygon", "formatVersion"];
            }];
        };
        readonly object3d: {};
        readonly assets: {
            readonly sources: [{
                readonly source: {
                    readonly type: "view";
                    readonly externalId: "CogniteAsset";
                    readonly space: "cdf_cdm";
                    readonly version: "v1";
                };
                readonly properties: ["name", "description", "object3D"];
            }];
        };
    };
} {
  return {
    with: {
      collection: {
        nodes: {
          filter: {
            and: [
              isCoreDmImage360CollectionFilter,
              getNodeExternalIdEqualsFilter(collectionReference.externalId),
              getNodeSpaceEqualsFilter(collectionReference.space)
            ]
          }
        }
      },
      images: {
        nodes: {
          from: 'collection',
          through: {
            view: CORE_DM_IMAGE_360_VIEW_REFERENCE,
            identifier: 'collection360'
          },
          direction: 'inwards'
        },
        limit: 10000
      },
      annotations: {
        edges: {
          from: 'images',
          direction: 'inwards',
          filter: {
            and: [
              {
                hasData: [CORE_DM_IMAGE_360_ANNOTATION_VIEW_REFERENCE]
              }
            ]
          }
        },
        limit: 10000
      },
      object3d: {
        nodes: {
          from: 'annotations'
        },
        limit: 10000
      },
      assets: {
        nodes: {
          from: 'object3d',
          through: {
            view: COGNITE_ASSET_VIEW_REFERENCE,
            identifier: 'object3D'
          }
        },
        limit: 10000
      }
    },
    select: {
      collection: {},
      images: {
        sources: [
          {
            source: CORE_DM_IMAGE_360_VIEW_REFERENCE,
            properties: CORE_DM_IMAGE_360_PROPERTIES_LIST
          }
        ]
      },
      annotations: {
        sources: [
          {
            source: CORE_DM_IMAGE_360_ANNOTATION_VIEW_REFERENCE,
            properties: CORE_DM_IMAGE_360_ANNOTATIONS_PROPERTIES_LIST
          }
        ]
      },
      object3d: {},
      assets: {
        sources: [
          {
            source: COGNITE_ASSET_VIEW_REFERENCE,
            properties: ASSET_SIMPLE_PROPERTIES_LIST
          }
        ]
      }
    }
  } as const satisfies QueryRequest;
}
