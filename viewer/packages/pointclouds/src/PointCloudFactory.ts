/*!
 * Copyright 2021 Cognite AS
 */

import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { PointCloudMetadata } from './PointCloudMetadata';

import { ModelIdentifier, CdfModelIdentifier } from '@reveal/modeldata-api';

import { CdfPointCloudObjectAnnotation } from './annotationTypes';
import { annotationsToObjectInfo } from './styling/annotationsToObjects';

import { Potree } from './potree-three-loader';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from './constants';

import { CogniteClient } from '@cognite/sdk';

import { PointCloudObjectProvider } from './styling/PointCloudObjectProvider';
import { Box } from './styling/shapes/Box';
import { Cylinder } from './styling/shapes/Cylinder';
import { IShape } from './styling/shapes/IShape';

import * as THREE from 'three';

export class PointCloudFactory {
  private readonly _potreeInstance: Potree;
  private readonly _sdkClient: CogniteClient | undefined;

  constructor(potreeInstance: Potree, sdkClient?: CogniteClient | undefined) {
    this._potreeInstance = potreeInstance;
    this._sdkClient = sdkClient;
  }

  get potreeInstance(): Potree {
    return this._potreeInstance;
  }

  private annotationGeometryToLocalGeometry(geometry: any): IShape {
    if (geometry.box) {
      return new Box(new THREE.Matrix4().fromArray(geometry.box.matrix).transpose().invert());
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

  private async getAnnotations(modelIdentifier: CdfModelIdentifier): Promise<CdfPointCloudObjectAnnotation[]> {
    const modelAnnotations = await this._sdkClient!.annotations.list({
      filter: {
        // @ts-ignore
        annotatedResourceType: 'threedmodel',
        annotatedResourceIds: [{ id: modelIdentifier.modelId }]
      },
      limit: 1000
    }).autoPagingToArray({ limit: Infinity });

    const annotations = modelAnnotations.map(annotation => {
      const region = (annotation.data as any).region.map((geometry: any) => {
        return this.annotationGeometryToLocalGeometry(geometry);
      });

      return {
        annotationId: annotation.id,
        assetId: annotation.annotatedResourceId,
        region
      };
    });

    return annotations;
  }

  async createModel(modelIdentifier: ModelIdentifier, modelMetadata: PointCloudMetadata): Promise<PotreeNodeWrapper> {
    const { modelBaseUrl } = modelMetadata;

    let annotationInfo = new PointCloudObjectProvider([]);

    if (this._sdkClient) {
      const annotations = await this.getAnnotations(modelIdentifier as CdfModelIdentifier);
      annotationInfo = annotationsToObjectInfo(annotations);
    }

    const pointCloudOctree = await this._potreeInstance.loadPointCloud(
      modelBaseUrl,
      DEFAULT_POINT_CLOUD_METADATA_FILE,
      annotationInfo
    );

    pointCloudOctree.name = `PointCloudOctree: ${modelBaseUrl}`;
    return new PotreeNodeWrapper(pointCloudOctree, annotationInfo.annotations);
  }
}
