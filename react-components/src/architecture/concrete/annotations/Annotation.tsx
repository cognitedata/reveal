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
      const cdfGeometry = createCdfGeometry(primitive);
      if (cdfGeometry === undefined) {
        console.error('The Cdf geometry is not a box or a cylinder');
        continue;
      }
      result.push(cdfGeometry);
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
      for (const cdfGeometry of data.region) {
        const primitive = createPrimitive(cdfGeometry);
        if (primitive === undefined) {
          console.error('The primitive is not a box or a cylinder');
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

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function createPrimitive(cdfGeometry: AnnotationGeometry): Primitive | undefined {
  if (cdfGeometry.box !== undefined) {
    return createBox(cdfGeometry.box);
  }
  if (cdfGeometry.cylinder !== undefined) {
    return createCylinder(cdfGeometry.cylinder);
  }
  return undefined;
}

function createBox(cdfBox: AnnotationsBox): Box {
  const matrix = new Matrix4().fromArray(cdfBox.matrix).transpose();
  const box = new Box();
  box.setMatrix(matrix);
  box.label = cdfBox.label;
  box.confidence = cdfBox.confidence;
  return box;
}

function createCylinder(cdfCylinder: AnnotationsCylinder): Cylinder {
  const cylinder = new Cylinder();
  cylinder.centerA.copy(new Vector3(...cdfCylinder.centerA));
  cylinder.centerB.copy(new Vector3(...cdfCylinder.centerB));
  cylinder.radius = cdfCylinder.radius;
  cylinder.label = cdfCylinder.label;
  cylinder.confidence = cdfCylinder.confidence;
  return cylinder;
}

function createCdfGeometry(primitive: Primitive): AnnotationGeometry | undefined {
  if (primitive instanceof Box) {
    return { box: createCdfBox(primitive) };
  } else if (primitive instanceof Cylinder) {
    return { cylinder: createCdfCylinder(primitive) };
  } else {
    return undefined;
  }
}

function createCdfBox(primitive: Box): AnnotationsBox {
  return {
    matrix: primitive.getMatrix().clone().transpose().elements,
    confidence: primitive.confidence,
    label: primitive.label
  };
}

function createCdfCylinder(primitive: Cylinder): AnnotationsCylinder {
  return {
    centerA: primitive.centerA.toArray(),
    centerB: primitive.centerB.toArray(),
    radius: primitive.radius / (1 + CYLINDER_RADIUS_MARGIN),
    confidence: primitive.confidence,
    label: primitive.label
  };
}
