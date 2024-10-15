/*!
 * Copyright 2024 Cognite AS
 */

import {
  CogniteClient,
  AnnotationData,
  AnnotationsBoundingVolume,
  AnnotationsCogniteAnnotationTypesPrimitivesGeometry3DGeometry as AnnotationsGeometry
} from '@cognite/sdk';
import { IShape, Box, Cylinder } from '@reveal/utilities';

import * as THREE from 'three';
import { CdfPointCloudObjectAnnotation, PointCloudAnnotationDataModelIdentifier, PointCloudObject } from '../types';
import { PointCloudStylableObjectProvider } from '../../PointCloudStylableObjectProvider';
import { cdfAnnotationsToObjectInfo } from '../cdfAnnotationsToObjects';
import { DataModelsSdk } from '../../DataModelsSdk';
import {
  CdfPointCloudAnnotationDMQuery,
  getPointCloudAnnotationCollectionQuery
} from './datamodels/getPointCloudAnnotationCollectionQuery';
import { QueryNextCursors } from '../../types';

type QueryResult = Awaited<
  ReturnType<typeof DataModelsSdk.prototype.queryNodesAndEdges<CdfPointCloudAnnotationDMQuery>>
>;

type ExhaustedQueryResult = {
  pointCloudVolumes: QueryResult['pointCloudVolumes'];
  assets: QueryResult['assets'];
  object3D: QueryResult['object3D'];
};

export class CdfPointCloudDataModelStylableObjectProvider
  implements PointCloudStylableObjectProvider<PointCloudAnnotationDataModelIdentifier>
{
  private readonly _dmsSdk: DataModelsSdk;
  private readonly _sdk: CogniteClient;

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
    this._dmsSdk = new DataModelsSdk(sdk);
  }

  private annotationGeometryToRevealShapes(geometry: AnnotationsGeometry): IShape {
    if (geometry.box) {
      return new Box(new THREE.Matrix4().fromArray(geometry.box.matrix).transpose());
    }

    if (geometry.cylinder) {
      return new Cylinder(
        new THREE.Vector3().fromArray(geometry.cylinder.centerA),
        new THREE.Vector3().fromArray(geometry.cylinder.centerB),
        geometry.cylinder.radius
      );
    }

    throw Error('Annotation geometry type not recognized');
  }

  private is3dObjectAnnotation(annotationData: AnnotationData): annotationData is AnnotationsBoundingVolume {
    return (annotationData as AnnotationsBoundingVolume).region !== undefined;
  }

  async getPointCloudObjects(modelIdentifier: PointCloudAnnotationDataModelIdentifier): Promise<PointCloudObject[]> {
    const result: ExhaustedQueryResult = {
      pointCloudVolumes: [],
      assets: [],
      object3D: []
    };
    const query = getPointCloudAnnotationCollectionQuery(
      modelIdentifier.pointCloudModelExternalId,
      modelIdentifier.pointCloudModelRevisionId,
      modelIdentifier.space
    );

    const annotationLimit = query.with.pointCloudVolumes.limit;
    let nextCursor: QueryNextCursors<CdfPointCloudAnnotationDMQuery> | undefined = undefined;
    let hasNext = true;

    while (hasNext) {
      const {
        pointCloudVolumes,
        assets,
        object3D,
        nextCursor: currentCursor
      }: QueryResult = await this._dmsSdk.queryNodesAndEdges(query, nextCursor);
      if (result.pointCloudVolumes.length === 0) {
        result.pointCloudVolumes.push(...pointCloudVolumes);
      }
      result.assets.push(...assets);
      result.object3D.push(...object3D);

      hasNext =
        assets.length === annotationLimit &&
        currentCursor?.assets !== undefined &&
        currentCursor?.object3D !== undefined;
      nextCursor = {
        assets: currentCursor?.assets,
        object3D: currentCursor?.object3D
      };
    }

    const annotations: CdfPointCloudObjectAnnotation[] = result.pointCloudVolumes.map(volume => ({
      annotationId: Number(volume.externalId),
      region: volume,
      volume,
      assets: result.assets,
      object3D: result.object3D
    }));
    return cdfAnnotationsToObjectInfo(annotations);
  }
}
