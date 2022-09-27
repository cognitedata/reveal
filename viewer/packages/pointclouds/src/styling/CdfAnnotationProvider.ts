/*!
 * Copyright 2022 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk/dist/src';
import { CdfModelIdentifier, ModelIdentifier } from '@reveal/data-providers';
import assert from 'assert';
import { CdfPointCloudObjectAnnotation } from '../annotationTypes';
import { IAnnotationProvider } from './IAnnotationProvider';
import { PointCloudObjectAnnotationData } from './PointCloudObjectAnnotationData';
import { IShape, ShapeType } from './shapes/IShape';

import * as THREE from 'three';
import { Box } from './shapes/Box';
import { Cylinder } from './shapes/Cylinder';
import { annotationsToObjectInfo } from './annotationsToObjects';

export class CdfAnnotationProvider implements IAnnotationProvider {
  private readonly _sdk: CogniteClient;

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  private annotationGeometryToLocalGeometry(geometry: any): IShape {
    if (geometry.box) {
      return {
        shapeType: ShapeType.Box,
        invMatrix: { data: new THREE.Matrix4().fromArray(geometry.box.matrix).transpose().invert().toArray() }
      } as Box;
    }

    if (geometry.cylinder) {
      return {
        shapeType: ShapeType.Cylinder,
        centerA: geometry.cylinder.centerA,
        centerB: geometry.cylinder.centerB,
        radius: geometry.cylinder.radius
      } as Cylinder;
    }

    throw Error('Annotation geometry type not recognized');
  }

  private async fetchAnnotations(modelIdentifier: CdfModelIdentifier): Promise<CdfPointCloudObjectAnnotation[]> {
    const modelAnnotations = await this._sdk.annotations
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

  async getAnnotations(modelIdentifier: ModelIdentifier): Promise<PointCloudObjectAnnotationData> {
    assert(modelIdentifier instanceof CdfModelIdentifier);

    const annotations = await this.fetchAnnotations(modelIdentifier);

    return annotationsToObjectInfo(annotations);
  }
}
