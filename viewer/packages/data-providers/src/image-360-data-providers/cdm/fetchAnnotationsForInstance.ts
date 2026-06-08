/*!
 * Copyright 2025 Cognite AS
 */
import type { CogniteClient, QueryRequest } from '@cognite/sdk';
import type { DMInstanceRef } from '@reveal/utilities';
import { queryNodesAndEdges } from './queryNodesAndEdges';
import type { Image360AnnotationViewReferenceAndProperties } from './types';
import { CORE_DM_IMAGE_360_ANNOTATION_VIEW_REFERENCE, CORE_DM_IMAGE_360_VIEW_REFERENCE } from './sources';
import { COGNITE_VISUALIZABLE_SOURCE } from '../../utilities/constants';
import { CORE_DM_IMAGE_360_ANNOTATIONS_PROPERTIES_LIST, CORE_DM_IMAGE_360_PROPERTIES_LIST } from './queryProperties';

export type Image360AnnotationsForInstanceResult = {
  annotationIds: DMInstanceRef[];
  imageRevisionIds: DMInstanceRef[];
};

export async function fetchAnnotationsForInstance(
  instance: DMInstanceRef,
  sdk: CogniteClient
): Promise<Image360AnnotationsForInstanceResult> {
  const query = getImage360AnnotationsForInstanceQuery(instance);

  const result = await queryNodesAndEdges<
    ReturnType<typeof getImage360AnnotationsForInstanceQuery>,
    Image360AnnotationViewReferenceAndProperties
  >(query, sdk);

  const annotationIds = result.items.annotation_edges.map(edge => ({ externalId: edge.externalId, space: edge.space }));
  const imageRevisionIds = result.items.image_revisions.map(revision => ({
    externalId: revision.externalId,
    space: revision.space
  }));

  return { annotationIds, imageRevisionIds };
}

export type GetImage360AnnotationsForInstanceResponse = Awaited<
  ReturnType<
    typeof queryNodesAndEdges<
      ReturnType<typeof getImage360AnnotationsForInstanceQuery>,
      Image360AnnotationViewReferenceAndProperties
    >
  >
>;

function getImage360AnnotationsForInstanceQuery(instance: DMInstanceRef): {
    readonly with: {
        readonly instance_object: {
            readonly nodes: {
                readonly filter: {
                    readonly and: [{
                        readonly equals: {
                            readonly property: ["node", "externalId"];
                            readonly value: string;
                        };
                    }, {
                        readonly equals: {
                            readonly property: ["node", "space"];
                            readonly value: string;
                        };
                    }];
                };
            };
            readonly limit: 1;
        };
        readonly object3ds: {
            readonly nodes: {
                readonly from: "instance_object";
                readonly through: {
                    readonly view: {
                        readonly externalId: "CogniteVisualizable";
                        readonly space: "cdf_cdm";
                        readonly version: "v1";
                        readonly type: "view";
                    };
                    readonly identifier: "object3D";
                };
                readonly direction: "outwards";
            };
        };
        readonly annotation_edges: {
            readonly edges: {
                readonly from: "object3ds";
                readonly direction: "outwards";
                readonly filter: {
                    readonly hasData: [{
                        readonly type: "view";
                        readonly space: "cdf_cdm";
                        readonly externalId: "Cognite360ImageAnnotation";
                        readonly version: "v1";
                    }];
                };
            };
            readonly limit: 10000;
        };
        readonly image_revisions: {
            readonly nodes: {
                readonly from: "annotation_edges";
                readonly chainTo: "destination";
                readonly direction: "outwards";
            };
            readonly limit: 10000;
        };
    }; readonly select: {
        readonly image_revisions: {
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
        readonly annotation_edges: {
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
    };
} {
  return {
    with: {
      instance_object: {
        nodes: {
          filter: {
            and: [
              { equals: { property: ['node', 'externalId'], value: instance.externalId } },
              { equals: { property: ['node', 'space'], value: instance.space } }
            ]
          }
        },
        limit: 1
      },
      object3ds: {
        nodes: {
          from: 'instance_object',
          through: { view: COGNITE_VISUALIZABLE_SOURCE, identifier: 'object3D' },
          direction: 'outwards'
        }
      },
      annotation_edges: {
        edges: {
          from: 'object3ds',
          direction: 'outwards',
          filter: {
            hasData: [CORE_DM_IMAGE_360_ANNOTATION_VIEW_REFERENCE]
          }
        },
        limit: 10000
      },
      image_revisions: {
        nodes: {
          from: 'annotation_edges',
          chainTo: 'destination',
          direction: 'outwards'
        },
        limit: 10000
      }
    },
    select: {
      image_revisions: {
        sources: [
          {
            source: CORE_DM_IMAGE_360_VIEW_REFERENCE,
            properties: CORE_DM_IMAGE_360_PROPERTIES_LIST
          }
        ]
      },
      annotation_edges: {
        sources: [
          {
            source: CORE_DM_IMAGE_360_ANNOTATION_VIEW_REFERENCE,
            properties: CORE_DM_IMAGE_360_ANNOTATIONS_PROPERTIES_LIST
          }
        ]
      }
    }
  } as const satisfies QueryRequest;
}
