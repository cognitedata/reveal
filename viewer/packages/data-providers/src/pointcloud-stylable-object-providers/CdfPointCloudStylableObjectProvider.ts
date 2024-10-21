/*!
 * Copyright 2022 Cognite AS
 */

import {
  CogniteClient,
  AnnotationData,
  AnnotationsBoundingVolume,
  AnnotationsCogniteAnnotationTypesPrimitivesGeometry3DGeometry as AnnotationsGeometry
} from '@cognite/sdk';
import { ModelIdentifier } from '../ModelIdentifier';
import { CdfModelIdentifier } from '../model-identifiers/CdfModelIdentifier';
import { IShape, Box, Cylinder } from '@reveal/utilities';
import assert from 'assert';
import { CdfPointCloudObjectAnnotation, DMPointCloudVolumeIdentifier, PointCloudObject } from './types';
import { PointCloudStylableObjectProvider } from '../PointCloudStylableObjectProvider';

import * as THREE from 'three';
import { cdfAnnotationsToObjectInfo } from './cdfAnnotationsToObjects';
import { DataModelsSdk } from '../DataModelsSdk';
import { getDMPointCloudObjects } from '../utilities/getDMPointCloudObjects';

export class CdfPointCloudStylableObjectProvider implements PointCloudStylableObjectProvider {
  private readonly _sdk: CogniteClient;
  private readonly _dmsSdk: DataModelsSdk;

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
      assert(this.is3dObjectAnnotation(annotation.data));

      const region = annotation.data.region.map(geometry => {
        return this.annotationGeometryToRevealShapes(geometry);
      });

      return {
        annotationId: annotation.id,
        asset: annotation.data.assetRef,
        region
      };
    });

    return annotations;
  }

  getDataModelIdentifier(modelIdentifier: CdfModelIdentifier): DMPointCloudVolumeIdentifier | undefined {
    if (modelIdentifier.space === undefined || modelIdentifier.space === '') {
      return;
    }
    const dataModelIdentifier = {
      space: modelIdentifier.space,
      pointCloudModelExternalId: (modelIdentifier as CdfModelIdentifier).modelId.toString(),
      pointCloudModelRevisionId: (modelIdentifier as CdfModelIdentifier).revisionId.toString()
    };
    return dataModelIdentifier;
  }

  async getPointCloudObjects(modelIdentifier: ModelIdentifier): Promise<PointCloudObject[]> {
    assert(modelIdentifier instanceof CdfModelIdentifier);

    const dataModelIdentifier = this.getDataModelIdentifier(modelIdentifier as CdfModelIdentifier);
    const annotations = dataModelIdentifier
      ? await getDMPointCloudObjects(this._dmsSdk, dataModelIdentifier)
      : await this.fetchAnnotations(modelIdentifier as CdfModelIdentifier);

    return cdfAnnotationsToObjectInfo(annotations);
  }
}
