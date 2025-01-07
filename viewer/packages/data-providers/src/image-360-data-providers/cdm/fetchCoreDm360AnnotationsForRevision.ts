/*!
 * Copyright 2025 Cognite AS
 */
import { CogniteClient, QueryRequest } from '@cognite/sdk';
import { transformAnnotations } from './transformCdmAnnotations';
import {
  COGNITE_ASSET_VIEW_REFERENCE,
  CORE_DM_IMAGE_360_ANNOTATION_VIEW_REFERENCE,
  CORE_DM_IMAGE_360_VIEW_REFERENCE
} from './sources';
import {
  ASSET_SIMPLE_PROPERTIES_LIST,
  CORE_DM_IMAGE_360_ANNOTATIONS_PROPERTIES_LIST,
  CORE_DM_IMAGE_360_PROPERTIES_LIST
} from './queryProperties';
import { isCoreDmImage360Filter } from './queryFilters';
import { getNodeExternalIdEqualsFilter, getNodeSpaceEqualsFilter } from '../../utilities/utils';
import { queryNodesAndEdges } from './queryNodesAndEdges';
import { CoreDmImage360Annotation, Image360AnnotationViewReferenceAndProperties } from './types';
import { DMInstanceRef } from '@reveal/utilities';

export async function fetchCoreDm360AnnotationsForRevision(
  revision: DMInstanceRef,
  sdk: CogniteClient
): Promise<CoreDmImage360Annotation[]> {
  const query = getImage360AnnotationsByRevisionQuery(revision);

  const selectFunction = (result: GetImage360FromRevisionResponse) => transformAnnotations(result);

  const result = await queryNodesAndEdges<typeof query, Image360AnnotationViewReferenceAndProperties>(query, sdk);

  return selectFunction(result);
}

export type GetImage360FromRevisionResponse = Awaited<
  ReturnType<
    typeof queryNodesAndEdges<
      ReturnType<typeof getImage360AnnotationsByRevisionQuery>,
      Image360AnnotationViewReferenceAndProperties
    >
  >
>;

function getImage360AnnotationsByRevisionQuery(revisionReference: DMInstanceRef) {
  return {
    with: {
      images: {
        nodes: {
          filter: {
            and: [
              isCoreDmImage360Filter,
              getNodeExternalIdEqualsFilter(revisionReference.externalId),
              getNodeSpaceEqualsFilter(revisionReference.space)
            ]
          }
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
