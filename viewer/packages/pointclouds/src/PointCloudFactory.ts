/*!
 * Copyright 2021 Cognite AS
 */

import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { PointCloudMetadata } from './PointCloudMetadata';

import { ModelIdentifier, CdfModelIdentifier } from '@reveal/modeldata-api';

import {
  PointCloudObjectAnnotation,
  CdfPointCloudObjectAnnotation,
  CylinderPrimitive,
  Geometry
} from './annotationTypes';
import { annotationsToObjectInfo } from './styling/annotationsToObjects';
import { BoxPrimitive } from './annotationTypes';

import { Potree } from './potree-three-loader';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from './constants';

import { CogniteClientPlayground } from '@cognite/sdk-playground';

import * as THREE from 'three';

export class PointCloudFactory {
  private readonly _potreeInstance: Potree;
  private readonly _sdkPlayground: CogniteClientPlayground | undefined;

  constructor(potreeInstance: Potree, sdkPlayground?: CogniteClientPlayground | undefined) {
    this._potreeInstance = potreeInstance;
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
      const centerA = new THREE.Vector3().fromArray(geometry.cylinder.centerA);
      const centerB = new THREE.Vector3().fromArray(geometry.cylinder.centerB);
      return new CylinderPrimitive(centerA, centerB, geometry.cylinder.radius);
    }

    throw Error('Annotation geometry type not recognized');
  }

  private async getAnnotations(modelIdentifier: CdfModelIdentifier): Promise<CdfPointCloudObjectAnnotation[]> {
    const modelAnnotations = await this._sdkPlayground!.annotations.list({
      filter: {
        // @ts-ignore
        annotatedResourceType: 'threedmodel',
        annotatedResourceIds: [{ id: modelIdentifier.modelId }]
      },
      limit: 1000
    }).autoPagingToArray({ limit: Infinity });

    const bvs = modelAnnotations.map(annotation => {
      const region = (annotation.data as any).region.map((geometry: any) => {
        return this.annotationGeometryToLocalGeometry(geometry);
      });

      return {
        annotationId: annotation.id,
        assetId: annotation.annotatedResourceId,
        region
      } as CdfPointCloudObjectAnnotation;
    });

    return bvs;
  }

  async createModel(modelIdentifier: ModelIdentifier, modelMetadata: PointCloudMetadata): Promise<PotreeNodeWrapper> {
    const { modelBaseUrl } = modelMetadata;

    let annotationInfo = {
      annotations: [] as PointCloudObjectAnnotation[],
      annotationIdToIndexMap: new Map<number, number>()
    };

    if (this._sdkPlayground) {
      const annotations = await this.getAnnotations(modelIdentifier as CdfModelIdentifier);
      annotationInfo = annotationsToObjectInfo(annotations);
    }

    const pointCloudOctree = await this._potreeInstance.loadPointCloud(
      modelBaseUrl,
      DEFAULT_POINT_CLOUD_METADATA_FILE,
      annotationInfo
    );

    pointCloudOctree.name = `PointCloudOctree: ${modelBaseUrl}`;
    return new PotreeNodeWrapper(pointCloudOctree, annotationInfo);
  }
}
