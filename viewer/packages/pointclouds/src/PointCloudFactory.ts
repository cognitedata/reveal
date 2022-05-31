/*!
 * Copyright 2021 Cognite AS
 */

import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { PointCloudMetadata } from './PointCloudMetadata';

import { ModelDataProvider, ModelIdentifier, CdfModelIdentifier } from '@reveal/modeldata-api';

import { BoundingVolume, CylinderPrimitive, Geometry } from './annotationTypes';
import { annotationsToObjectInfo } from './styling/annotationsToObjects';
import { BoxPrimitive } from './annotationTypes';

import { Potree } from './potree-three-loader';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from './constants';

import { CogniteClientPlayground } from '@cognite/sdk-playground';

import * as THREE from 'three';
import { RawStylableObject } from './styling/StylableObject';

export class PointCloudFactory {
  private readonly _potreeInstance: Potree;
  private readonly _sdkPlayground: CogniteClientPlayground | undefined;

  constructor(modelLoader: ModelDataProvider, sdkPlayground: CogniteClientPlayground | undefined) {
    this._potreeInstance = new Potree(modelLoader);
    this._sdkPlayground = sdkPlayground;
  }

  get potreeInstance(): Potree {
    return this._potreeInstance;
  }

  private annotationGeometryToLocalGeometry(geometry: any): Geometry {
    if (geometry.box) {
      return new BoxPrimitive(new THREE.Matrix4().fromArray(geometry.box.matrix));
    }

    if (geometry.cylinder) {
      return new CylinderPrimitive(geometry.cylinder.centerA, geometry.cylinder.centerA, geometry.cylinder.radius);
    }

    throw Error('Annotation geometry type not recognized');
  }

  private async getAnnotations(modelIdentifier: CdfModelIdentifier): Promise<BoundingVolume[]> {
    const modelAnnotations = await this._sdkPlayground!.annotations.list({
      filter: {
        // @ts-ignore
        annotatedResourceType: 'threedmodel',
        annotatedResourceIds: [{ id: modelIdentifier.modelId }]
      }
    });

    const bvs = modelAnnotations.items.map(annotation => {
      const region = (annotation.data as any).region.map((geometry: any) => {
        return this.annotationGeometryToLocalGeometry(geometry);
      });

      return {
        annotationId: annotation.id,
        region
      } as BoundingVolume;
    });

    return bvs;
  }

  async createModel(modelIdentifier: ModelIdentifier, modelMetadata: PointCloudMetadata): Promise<PotreeNodeWrapper> {
    const { modelBaseUrl } = modelMetadata;

    let stylableObjects: RawStylableObject[] = [];
    if (this._sdkPlayground && modelIdentifier instanceof CdfModelIdentifier) {
      const annotations = await this.getAnnotations(modelIdentifier);
      stylableObjects = annotationsToObjectInfo(annotations);
    }

    const pointCloudOctree = await this._potreeInstance.loadPointCloud(
      modelBaseUrl,
      DEFAULT_POINT_CLOUD_METADATA_FILE,
      stylableObjects
    );

    pointCloudOctree.name = `PointCloudOctree: ${modelBaseUrl}`;
    return new PotreeNodeWrapper(pointCloudOctree, stylableObjects);
  }
}
