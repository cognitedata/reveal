/*!
 * Copyright 2024 Cognite AS
 */

import { QueryRequest } from '@cognite/sdk';
import {
  pointCloudVolumeFilter,
  POINT_CLOUD_VOLUME_REVISIONS_OBJECT3D_PROPERTIES_LIST,
  ASSET_PROPERTIES_LIST
} from './types';
import { getModelEqualsFilter, getRevisionContainsAnyFilter } from './utils';
import {
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  COGNITE_ASSET_SOURCE
} from '../../utilities/constants';
import { DMInstanceRef } from 'api-entry-points/core';

const getDMPointCloudVolumeQuery = (modelRef: DMInstanceRef, revisionRef: DMInstanceRef[]) => {
  const modelExternalId = `cog_3d_model_${modelRef.externalId}`;
  const revisionExternalId = `cog_3d_revision_${revisionRef[0].externalId}`;
  return {
    with: {
      pointCloudVolumes: {
        nodes: {
          filter: {
            and: [
              pointCloudVolumeFilter,
              getModelEqualsFilter({
                externalId: modelExternalId,
                space: modelRef.space
              }),
              getRevisionContainsAnyFilter([
                {
                  externalId: revisionExternalId,
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

export type CdfDMPointCloudVolumeQuery = ReturnType<typeof getDMPointCloudVolumeQuery>;

export function getDMPointCloudVolumeCollectionQuery(
  modelExternalId: string,
  revisionExternalId: string,
  space: string
): CdfDMPointCloudVolumeQuery {
  return getDMPointCloudVolumeQuery({ externalId: modelExternalId, space }, [
    { externalId: revisionExternalId, space }
  ]);
}
