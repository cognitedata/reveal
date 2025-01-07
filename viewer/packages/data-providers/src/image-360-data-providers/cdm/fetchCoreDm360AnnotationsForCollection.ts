/*!
 * Copyright 2025 Cognite AS
 */
import { CogniteClient, QueryRequest } from '@cognite/sdk/dist/src';
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
import { CoreDmImage360Annotation, Image360AnnotationViewReferenceAndProperties } from './types';
import { DMInstanceRef } from '@reveal/utilities';

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
