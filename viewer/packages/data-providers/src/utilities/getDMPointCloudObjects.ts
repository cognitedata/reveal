/*!
 * Copyright 2024 Cognite AS
 */
import { DataModelsSdk } from '../DataModelsSdk';
import {
  CdfDMPointCloudVolumeQuery,
  getDMPointCloudVolumeCollectionQuery
} from '../pointcloud-stylable-object-providers/pointcloud-volume-data-providers/getDMPointCloudVolumeCollectionQuery';
import { PointCloudVolumeObject3DProperties } from '../pointcloud-stylable-object-providers/pointcloud-volume-data-providers/types';
import {
  DMPointCloudVolumeIdentifier,
  CdfPointCloudObjectAnnotation
} from '../pointcloud-stylable-object-providers/types';
import { QueryNextCursors } from '../types';

import { IShape, Box, Cylinder } from '@reveal/utilities';
import * as THREE from 'three';

type QueryResult = Awaited<ReturnType<typeof DataModelsSdk.prototype.queryNodesAndEdges<CdfDMPointCloudVolumeQuery>>>;

type ExhaustedQueryResult = {
  pointCloudVolumes: QueryResult['pointCloudVolumes'];
  assets: QueryResult['assets'];
};

function pointCloudVolumeToRevealShapes(volume: number[]): IShape {
  if (volume.length === 16) {
    const matrix = new THREE.Matrix4().fromArray(volume).transpose();
    return new Box(matrix);
  }
  if (volume.length === 7) {
    const centerA = new THREE.Vector3().fromArray(volume.slice(0, 3));
    const centerB = new THREE.Vector3().fromArray(volume.slice(3, 6));
    const radius = volume[6];
    return new Cylinder(centerA, centerB, radius);
  }

  throw Error('Volume is not recognized');
}

export async function getDMPointCloudObjects(
  dmsSdk: DataModelsSdk,
  modelIdentifier: DMPointCloudVolumeIdentifier
): Promise<CdfPointCloudObjectAnnotation[]> {
  const result: ExhaustedQueryResult = {
    pointCloudVolumes: [],
    assets: []
  };
  const query = getDMPointCloudVolumeCollectionQuery(
    modelIdentifier.pointCloudModelExternalId,
    modelIdentifier.pointCloudModelRevisionId,
    modelIdentifier.space
  );

  const annotationLimit = query.with.pointCloudVolumes.limit;
  let nextCursor: QueryNextCursors<CdfDMPointCloudVolumeQuery> | undefined = undefined;
  let hasNext = true;

  while (hasNext) {
    const {
      pointCloudVolumes,
      assets,
      nextCursor: currentCursor
    }: QueryResult = await dmsSdk.queryNodesAndEdges(query, nextCursor);
    if (result.pointCloudVolumes.length === 0) {
      result.pointCloudVolumes.push(...pointCloudVolumes);
    }
    result.assets.push(...assets);

    hasNext = assets.length === annotationLimit && currentCursor?.assets !== undefined;
    nextCursor = {
      assets: currentCursor?.assets
    };
  }

  const annotations: CdfPointCloudObjectAnnotation[] = result.pointCloudVolumes.map((volume, index) => {
    const pointCloudVolumeProperties = volume.properties.cdf_cdm[
      'CognitePointCloudVolume/v1'
    ] as unknown as PointCloudVolumeObject3DProperties;
    const region = pointCloudVolumeToRevealShapes(pointCloudVolumeProperties.volume);

    return {
      annotationId: -1,
      instanceRef: { externalId: volume.externalId, space: volume.space },
      region: [region],
      asset: { externalId: result.assets[index].externalId }
    };
  });
  return annotations;
}
