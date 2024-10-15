/*!
 * Copyright 2024 Cognite AS
 */

import { DirectRelationReference, QueryRequest } from '@cognite/sdk';
import {
  pointCloudVolumeFilter,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  POINT_CLOUD_VOLUME_REVISIONS_OBJECT3D_PROPERTIES_LIST,
  ASSET_PROPERTIES_LIST,
  COGNITE_ASSET_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  COGNITE_3D_OBJECT_SOURCE
} from './types';
import { getModelEqualsFilter, getRevisionContainsAnyFilter } from './utils';

const getPointCloudDMAnnotationsQuery = (modelRef: DirectRelationReference, revisionRef: DirectRelationReference[]) => {
  return {
    with: {
      pointCloudVolumes: {
        nodes: {
          filter: {
            and: [
              pointCloudVolumeFilter,
              getModelEqualsFilter({
                externalId: modelRef.externalId,
                space: modelRef.space
              }),
              getRevisionContainsAnyFilter([
                {
                  externalId: revisionRef[0].externalId,
                  space: revisionRef[0].space
                }
              ])
            ]
          }
        },
        limit: 1000
      },
      object3D: {
        nodes: {
          from: 'pointCloudVolumes',
          through: {
            view: COGNITE_POINT_CLOUD_VOLUME_SOURCE,
            identifier: 'object3D'
          },
          direction: 'outwards'
        },
        limit: 1000
      },
      assets: {
        nodes: {
          from: 'object3D',
          through: {
            view: COGNITE_VISUALIZABLE_SOURCE,
            identifier: 'object3D'
          }
        },
        limit: 1000
      }
    },
    select: {
      pointCloudVolumes: {
        sources: [
          {
            source: COGNITE_POINT_CLOUD_VOLUME_SOURCE,
            properties: POINT_CLOUD_VOLUME_REVISIONS_OBJECT3D_PROPERTIES_LIST
          }
        ]
      },
      object3D: {
        sources: [
          {
            source: COGNITE_3D_OBJECT_SOURCE,
            properties: ['object3D']
          }
        ]
      },
      assets: {
        sources: [
          {
            source: COGNITE_ASSET_SOURCE,
            properties: ASSET_PROPERTIES_LIST
          }
        ]
      }
    }
  } as const satisfies QueryRequest;
};

export type CdfPointCloudAnnotationDMQuery = ReturnType<typeof getPointCloudDMAnnotationsQuery>;

export function getPointCloudAnnotationCollectionQuery(
  modelExternalId: string,
  revisionExternalId: string,
  space: string
): CdfPointCloudAnnotationDMQuery {
  return getPointCloudDMAnnotationsQuery({ externalId: modelExternalId, space }, [
    { externalId: revisionExternalId, space }
  ]);
}
