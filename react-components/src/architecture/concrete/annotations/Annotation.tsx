/*!
 * Copyright 2024 Cognite AS
 */

import { Cylinder } from '../../base/utilities/primitives/Cylinder';
import { type Primitive } from '../../base/utilities/primitives/Primitive';
import {
  type CogniteClient,
  type AnnotationChangeById,
  type AnnotationsCogniteAnnotationTypesPrimitivesGeometry3DGeometry as AnnotationGeometry,
  type AnnotationsCylinder,
  type AnnotationsBox,
  type AnnotationCreate,
  type AnnotationStatus,
  type AnnotationsBoundingVolume
} from '@cognite/sdk';
import { CYLINDER_RADIUS_MARGIN } from './utils/constants';
import { Box } from '../../base/utilities/primitives/Box';
import { Matrix4, Vector3 } from 'three';

const ANNOTATED_RESOURCE_TYPE = 'threedmodel';
const ANNOTATION_TYPE = 'pointcloud.BoundingVolume';
const CREATING_APP = '3d-management';
const CREATING_APP_VERSION = '0.0.1';
const CREATING_USER = '3d-management';

export class Annotation {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public id: number = 0;
  public modelId: number = 0;
  public assetId: number | undefined = undefined;
  public status: AnnotationStatus = 'suggested';
  public primitives = new Array<Primitive>();
  public confidence: number | undefined = undefined;
  public label: string | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get isEmpty(): boolean {
    return this.primitives.length === 0;
  }

  public get hasAssetRef(): boolean {
    return this.assetId !== undefined;
  }

  public get resultingStatus(): AnnotationStatus {
    return this.hasAssetRef ? 'approved' : this.status;
  }

  public get firstLabel(): string | undefined {
    return this.isEmpty ? undefined : this.primitives[0].label;
  }

  public get getConfidence(): number | undefined {
    return this.isEmpty ? undefined : this.primitives[0].confidence;
  }

  private createRegion(): AnnotationGeometry[] {
    const result: AnnotationGeometry[] = [];
    for (const primitive of this.primitives) {
      if (primitive instanceof Cylinder) {
        result.push({ cylinder: Annotation.createCylinder(primitive) });
      } else if (primitive instanceof Box) {
        result.push({ box: Annotation.createBox(primitive) });
      } else {
        console.error('Not a box or a cylinder');
      }
    }
    return result;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public async update(sdk: CogniteClient): Promise<boolean> {
    const changes: AnnotationChangeById[] = [
      {
        id: this.id,
        update: {
          status: {
            set: this.resultingStatus
          },
          data: {
            set: {
              region: this.createRegion(),
              assetRef: { id: this.assetId }
            }
          }
        }
      }
    ];
    await sdk.annotations.update(changes);
    return true;
  }

  public async create(sdk: CogniteClient): Promise<boolean> {
    const changes: AnnotationCreate[] = [
      {
        status: this.resultingStatus,
        data: {
          region: this.createRegion(),
          assetRef: { id: this.assetId },
          confidence: 1,
          label: this.firstLabel
        },
        annotatedResourceType: ANNOTATED_RESOURCE_TYPE,
        annotatedResourceId: this.modelId,
        annotationType: ANNOTATION_TYPE,
        creatingApp: CREATING_APP,
        creatingAppVersion: CREATING_APP_VERSION,
        creatingUser: CREATING_USER
      }
    ];
    const result = await sdk.annotations.create(changes);
    this.id = result[0].id;
    return true;
  }

  public async delete(sdk: CogniteClient): Promise<boolean> {
    const changes = [{ id: this.id }];
    await sdk.annotations.delete(changes);
    return true;
  }

  // ==================================================
  // STATIC METHODS
  // ==================================================

  private static createCylinder(primitive: Cylinder): AnnotationsCylinder {
    return {
      centerA: primitive.centerA.toArray(),
      centerB: primitive.centerB.toArray(),
      radius: primitive.radius / (1 + CYLINDER_RADIUS_MARGIN),
      confidence: primitive.confidence,
      label: primitive.label
    };
  }

  private static createBox(primitive: Box): AnnotationsBox {
    return {
      matrix: primitive.getMatrix().clone().transpose().elements,
      confidence: primitive.confidence,
      label: primitive.label
    };
  }

  public static async loadAnnotations(
    client: CogniteClient,
    modelId: number
  ): Promise<Annotation[]> {
    const cdfAnnotations = await client.annotations
      .list({
        filter: {
          annotatedResourceType: ANNOTATED_RESOURCE_TYPE,
          annotationType: ANNOTATION_TYPE,
          annotatedResourceIds: [{ id: modelId }]
        },
        limit: 1000
      })
      .autoPagingToArray({ limit: Infinity });

    const result: Annotation[] = [];

    for (const cdfAnnotation of cdfAnnotations) {
      const annotation = new Annotation();
      annotation.id = cdfAnnotation.id;
      annotation.modelId = cdfAnnotation.annotatedResourceId;

      const data = cdfAnnotation.data as AnnotationsBoundingVolume;
      annotation.confidence = data.confidence;
      annotation.label = data.label;
      // annotation.assetId = data.assetRef?.id ?? data.assetRef?.externalId;
      annotation.status = cdfAnnotation.status;

      const primitives = new Array<Primitive>();
      for (const geometry of data.region) {
        const primitive = createPrimitive(geometry);
        if (primitive === undefined) {
          continue;
        }
        primitives.push(primitive);
      }
      annotation.primitives = primitives;
      result.push(annotation);
    }
    return result;
  }
}

function createPrimitive(geometry: AnnotationGeometry): Primitive | undefined {
  if (geometry.cylinder !== undefined) {
    const cylinder = new Cylinder();
    cylinder.centerA.copy(new Vector3(...geometry.cylinder.centerA));
    cylinder.centerB.copy(new Vector3(...geometry.cylinder.centerB));
    cylinder.radius = geometry.cylinder.radius;
    cylinder.label = geometry.cylinder.label;
    cylinder.confidence = geometry.cylinder.confidence;
    return cylinder;
  }
  if (geometry.box !== undefined) {
    const matrix = new Matrix4().fromArray(geometry.box.matrix).transpose();
    const box = new Box();
    box.setMatrix(matrix);
    box.label = geometry.box.label;
    box.confidence = geometry.box.confidence;
    return box;
  }
  return undefined;
}
