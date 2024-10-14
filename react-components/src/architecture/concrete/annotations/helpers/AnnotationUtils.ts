/*!
 * Copyright 2024 Cognite AS
 */

import {
  type CogniteClient,
  type AnnotationChangeById,
  type AnnotationsCogniteAnnotationTypesPrimitivesGeometry3DGeometry as AnnotationGeometry,
  type AnnotationsCylinder,
  type AnnotationsBox,
  type AnnotationCreate,
  type AnnotationsBoundingVolume
} from '@cognite/sdk';
import { CYLINDER_RADIUS_MARGIN } from './constants';
import { Box } from '../../../base/utilities/primitives/Box';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { type Primitive } from '../../../base/utilities/primitives/Primitive';
import { Matrix4, Vector3 } from 'three';
import { Annotation, AssetCentricAssetId } from './Annotation';

const ANNOTATED_RESOURCE_TYPE = 'threedmodel';
const ANNOTATION_TYPE = 'pointcloud.BoundingVolume';
const CREATING_APP = '3d-management';
const CREATING_APP_VERSION = '0.0.1';
const CREATING_USER = '3d-management';

export class AnnotationUtils {
  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public static async update(sdk: CogniteClient, annotation: Annotation): Promise<boolean> {
    const changes: AnnotationChangeById[] = [
      {
        id: annotation.id,
        update: {
          status: {
            set: annotation.resultingCdfStatus
          },
          data: {
            set: {
              region: createCdfGeometries(annotation.primitives),
              assetRef: {
                id: annotation.getAssetRefId(),
                externalId: annotation.getAssetRefExternalId()
              },
              confidence: annotation.confidence,
              label: annotation.label
            }
          }
        }
      }
    ];
    await sdk.annotations.update(changes);
    return true;
  }

  public static async create(sdk: CogniteClient, annotation: Annotation): Promise<boolean> {
    const changes: AnnotationCreate[] = [
      {
        status: annotation.resultingCdfStatus,
        data: {
          region: createCdfGeometries(annotation.primitives),
          assetRef: {
            id: annotation.getAssetRefId(),
            externalId: annotation.getAssetRefExternalId()
          },
          confidence: annotation.confidence,
          label: annotation.label
        },
        annotatedResourceType: ANNOTATED_RESOURCE_TYPE,
        annotatedResourceId: annotation.modelId,
        annotationType: ANNOTATION_TYPE,
        creatingApp: CREATING_APP,
        creatingAppVersion: CREATING_APP_VERSION,
        creatingUser: CREATING_USER
      }
    ];
    const result = await sdk.annotations.create(changes);
    annotation.id = result[0].id;
    return true;
  }

  public static async delete(sdk: CogniteClient, annotation: Annotation): Promise<boolean> {
    const changes = [{ id: annotation.id }];
    await sdk.annotations.delete(changes);
    return true;
  }

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static async fetchAllAnnotations(
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

      const assetId = new AssetCentricAssetId();
      if (data.assetRef !== undefined) {
        if (data.assetRef.id !== undefined) {
          assetId.id = data.assetRef.id;
        }
        if (data.assetRef.externalId !== undefined) {
          assetId.externalId = data.assetRef.externalId;
        }
      }
      annotation.assetId = assetId;
      annotation.status = cdfAnnotation.status;
      annotation.primitives = createPrimitives(data.region);
      result.push(annotation);
    }
    return result;
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function createPrimitives(cdfGeometries: AnnotationGeometry[]): Primitive[] {
  const primitives: Primitive[] = [];
  for (const cdfGeometry of cdfGeometries) {
    const primitive = createPrimitive(cdfGeometry);
    if (primitive === undefined) {
      console.error('The primitive is not a box or a cylinder');
      continue;
    }
    primitives.push(primitive);
  }
  return primitives;
}

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
  cylinder.radius = cdfCylinder.radius * (1 + CYLINDER_RADIUS_MARGIN);
  cylinder.label = cdfCylinder.label;
  cylinder.confidence = cdfCylinder.confidence;
  return cylinder;
}

function createCdfGeometries(primitives: Primitive[]): AnnotationGeometry[] {
  const cdfGeometries: AnnotationGeometry[] = [];
  for (const primitive of primitives) {
    const cdfGeometry = createCdfGeometry(primitive);
    if (cdfGeometry === undefined) {
      console.error('The Cdf geometry is not a box or a cylinder');
      continue;
    }
    cdfGeometries.push(cdfGeometry);
  }
  return cdfGeometries;
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
    matrix: primitive.getMatrix().transpose().elements,
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
