/*!
 * Copyright 2025 Cognite AS
 */
import type { CogniteClient, QueryRequest } from '@cognite/sdk';
import { getNodeExternalIdEqualsFilter, getNodeSpaceEqualsFilter } from '../../utilities/utils';
import {
  isCoreDmImage360AnnotationFilter,
  isCoreDmImage360CollectionFilter,
  isCoreDmImage360Filter,
  isCoreDmObject3DFilter,
  isCoreDmVisualizableFilter
} from './queryFilters';
import { queryNodesAndEdges } from './queryNodesAndEdges';
import {
  ASSET_SIMPLE_PROPERTIES_LIST,
  CORE_DM_IMAGE_360_ANNOTATIONS_PROPERTIES_LIST,
  CORE_DM_IMAGE_360_PROPERTIES_LIST
} from './queryProperties';
import {
  COGNITE_ASSET_VIEW_REFERENCE,
  COGNITE_VISUALIZABLE_VIEW_REFERENCE,
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

function getImage360AnnotationsQuery(collectionReference: DMInstanceRef) {
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
        },
        limit: 1
      },
      images: {
        nodes: {
          from: 'collection',
          through: {
            view: CORE_DM_IMAGE_360_VIEW_REFERENCE,
            identifier: 'collection360'
          },
          direction: 'inwards',
          filter: isCoreDmImage360Filter
        },
        limit: 10000
      },
      annotations: {
        edges: {
          from: 'images',
          direction: 'inwards',
          filter: isCoreDmImage360AnnotationFilter
        },
        limit: 10000
      },
      object3d: {
        nodes: {
          from: 'annotations',
          filter: isCoreDmObject3DFilter
        },
        limit: 10000
      },
      assets: {
        nodes: {
          from: 'object3d',
          through: {
            view: COGNITE_VISUALIZABLE_VIEW_REFERENCE,
            identifier: 'object3D'
          },
          filter: isCoreDmVisualizableFilter
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
