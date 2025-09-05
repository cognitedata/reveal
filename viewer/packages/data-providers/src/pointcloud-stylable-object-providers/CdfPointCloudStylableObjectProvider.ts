/*!
 * Copyright 2022 Cognite AS
 */

import {
  CogniteClient,
  AnnotationData,
  AnnotationsBoundingVolume,
  AnnotationsTypesPrimitivesGeometry3DGeometry as AnnotationsGeometry
} from '@cognite/sdk';
import { IShape, Box, Cylinder, DMInstanceRef } from '@reveal/utilities';
import assert from 'assert';
import { CdfPointCloudObjectAnnotation, PointCloudObject } from './types';
import { PointCloudStylableObjectProvider } from '../PointCloudStylableObjectProvider';

import * as THREE from 'three';
import { cdfAnnotationsToObjects } from './cdfAnnotationsToObjects';
import { ClassicDataSourceType, ClassicModelIdentifierType } from '../DataSourceType';

// The SDK type is out of date with the API. This type more accurately reflects the type of annotation
// the API provides
type AnnotationWithInstanceRefData = AnnotationsBoundingVolume & { instanceRef?: DMInstanceRef };

export class CdfPointCloudStylableObjectProvider implements PointCloudStylableObjectProvider<ClassicDataSourceType> {
  private readonly _sdk: CogniteClient;

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
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

  private is3dObjectAnnotation(annotationData: AnnotationData): annotationData is AnnotationWithInstanceRefData {
    return (annotationData as AnnotationsBoundingVolume).region !== undefined;
  }

  private async fetchAnnotations(
    modelIdentifier: ClassicModelIdentifierType
  ): Promise<CdfPointCloudObjectAnnotation[]> {
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

    return modelAnnotations.map(annotation => {
      assert(this.is3dObjectAnnotation(annotation.data));

      const region = annotation.data.region.map(geometry => {
        return this.annotationGeometryToRevealShapes(geometry);
      });

      return {
        volumeMetadata: {
          annotationId: annotation.id,
          asset: annotation.data.assetRef,
          assetInstanceRef: annotation.data.instanceRef
        },
        region
      };
    });
  }

  async getPointCloudObjects(modelIdentifier: ClassicModelIdentifierType): Promise<PointCloudObject[]> {
    const annotations = await this.fetchAnnotations(modelIdentifier);

    return cdfAnnotationsToObjects(annotations);
  }
}
