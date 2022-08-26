/*!
 * Copyright 2021 Cognite AS
 */

import { PotreeNodeWrapper } from '../PotreeNodeWrapper';
import { PointCloudMetadata } from '../PointCloudMetadata';

import { CdfModelIdentifier } from '@reveal/modeldata-api';

import { CdfPointCloudObjectAnnotation } from '../annotationTypes';
import { annotationsToObjectInfo } from '../styling/annotationsToObjects';

import { Potree } from '../potree-three-loader';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from '../constants';

import { CogniteClient } from '@cognite/sdk';

import { Box } from '../styling/shapes/Box';
import { createInvertedRevealTransformationFromCdfTransformation } from '../styling/shapes/linalg';
import { Cylinder } from '../styling/shapes/Cylinder';
import { IShape } from '../styling/shapes/IShape';
import { PointCloudFactory } from '../IPointCloudFactory';

export class CdfPointCloudFactory implements PointCloudFactory {
  private readonly _potreeInstance: Potree;
  private readonly _sdkClient: CogniteClient;

  constructor(potreeInstance: Potree, sdkClient: CogniteClient) {
    this._potreeInstance = potreeInstance;
    this._sdkClient = sdkClient;
  }

  get potreeInstance(): Potree {
    return this._potreeInstance;
  }

  private annotationGeometryToLocalGeometry(geometry: any): IShape {
    if (geometry.box) {
      return new Box(createInvertedRevealTransformationFromCdfTransformation({ data: geometry.box.matrix }));
    }

    if (geometry.cylinder) {
      return new Cylinder(geometry.cylinder.centerA, geometry.cylinder.centerB, geometry.cylinder.radius);
    }

    throw Error('Annotation geometry type not recognized');
  }

  private async getAnnotations(modelIdentifier: CdfModelIdentifier): Promise<CdfPointCloudObjectAnnotation[]> {
    const modelAnnotations = await this._sdkClient.annotations
      .list({
        filter: {
          // @ts-ignore
          annotatedResourceType: 'threedmodel',
          annotatedResourceIds: [{ id: modelIdentifier.modelId }]
        },
        limit: 1000
      })
      .autoPagingToArray({ limit: Infinity });

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

  async createModel(modelMetadata: PointCloudMetadata): Promise<PotreeNodeWrapper> {
    const { modelBaseUrl, modelIdentifier } = modelMetadata;

    const annotations = await this.getAnnotations(modelIdentifier as CdfModelIdentifier);

    const annotationInfo = annotationsToObjectInfo(annotations);

    const pointCloudOctree = await this._potreeInstance.loadPointCloud(
      modelBaseUrl,
      DEFAULT_POINT_CLOUD_METADATA_FILE,
      annotationInfo
    );

    pointCloudOctree.name = `PointCloudOctree: ${modelBaseUrl}`;
    return new PotreeNodeWrapper(pointCloudOctree, annotationInfo.annotations);
  }
}
