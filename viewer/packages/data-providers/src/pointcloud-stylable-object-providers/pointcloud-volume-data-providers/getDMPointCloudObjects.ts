/*!
 * Copyright 2024 Cognite AS
 */
import { Matrix4, Vector3 } from 'three';
import { DataModelsSdk } from '../../DataModelsSdk';
import {
  CdfDMPointCloudVolumeQuery,
  getDMPointCloudVolumeCollectionQuery
} from './getDMPointCloudVolumeCollectionQuery';
import { PointCloudVolumeObject3DProperties } from './types';
import { CdfPointCloudObjectAnnotation } from '../types';
import { QueryNextCursors } from '../../types';

import { IShape, Box, Cylinder, DMInstanceKey, dmInstanceRefToKey, DMInstanceRef } from '@reveal/utilities';
import { DMModelIdentifierType } from '../../DataSourceType';

type QueryResult = Awaited<ReturnType<typeof DataModelsSdk.prototype.queryNodesAndEdges<CdfDMPointCloudVolumeQuery>>>;

type ExhaustedQueryResult = {
  pointCloudVolumes: QueryResult['pointCloudVolumes'];
  assets: QueryResult['assets'];
};

function pointCloudVolumeToRevealShapes(volume: number[], volumeType: string): IShape {
  if (volumeType === 'Box') {
    const matrix = new Matrix4().fromArray(volume).transpose();
    return new Box(matrix);
  }
  if (volumeType === 'Cylinder') {
    const centerA = new Vector3().fromArray(volume.slice(0, 3));
    const centerB = new Vector3().fromArray(volume.slice(3, 6));
    const radius = volume[6];
    return new Cylinder(centerA, centerB, radius);
  }

  throw Error('Volume is not recognized');
}

export async function getDMPointCloudObjects(
  dmsSdk: DataModelsSdk,
  modelIdentifier: DMModelIdentifierType
): Promise<CdfPointCloudObjectAnnotation[]> {
  const result: ExhaustedQueryResult = {
    pointCloudVolumes: [],
    assets: []
  };
  const query = getDMPointCloudVolumeCollectionQuery(modelIdentifier.revisionExternalId, modelIdentifier.revisionSpace);

  const assetLimit = query.with.assets.limit;
  const volumeLimit = query.with.pointCloudVolumes.limit;
  let nextCursor: QueryNextCursors<CdfDMPointCloudVolumeQuery> | undefined = undefined;
  let hasNext = true;

  type AssetResult = ExhaustedQueryResult['assets'][number];

  while (hasNext) {
    const {
      pointCloudVolumes,
      assets,
      nextCursor: currentCursor
    }: QueryResult = await dmsSdk.queryNodesAndEdges(query, nextCursor);
    result.pointCloudVolumes.push(...pointCloudVolumes);
    result.assets.push(...assets);

    hasNext =
      (assets.length === assetLimit && currentCursor?.assets !== undefined) ||
      (pointCloudVolumes.length === volumeLimit && currentCursor?.pointCloudVolumes !== undefined);
    nextCursor = currentCursor;
  }

  const object3DAndAssetPairs: [DMInstanceKey, AssetResult][] = result.assets.map(asset => [
    dmInstanceRefToKey(asset.properties.cdf_cdm['CogniteAsset/v1'].object3D as DMInstanceRef),
    asset
  ]);

  const object3DToAssetMap = new Map<DMInstanceKey, AssetResult>(object3DAndAssetPairs);

  const annotations: CdfPointCloudObjectAnnotation[] = result.pointCloudVolumes
    .map(volume => {
      const pointCloudVolumeProperties = volume.properties.cdf_cdm[
        'CognitePointCloudVolume/v1'
      ] as unknown as PointCloudVolumeObject3DProperties;
      const region = pointCloudVolumeToRevealShapes(
        pointCloudVolumeProperties.volume,
        pointCloudVolumeProperties.volumeType
      );

      const asset = object3DToAssetMap.get(
        dmInstanceRefToKey(volume.properties.cdf_cdm['CognitePointCloudVolume/v1'].object3D as DMInstanceRef)
      );

      if (asset === undefined) {
        return undefined;
      }

      return {
        volumeMetadata: {
          instanceRef: { externalId: volume.externalId, space: volume.space },
          asset: { externalId: asset.externalId, space: asset.space }
        },
        region: [region]
      };
    })
    .filter(result => result !== undefined);

  return annotations;
}
