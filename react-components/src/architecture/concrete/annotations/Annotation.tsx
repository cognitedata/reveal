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
  type AnnotationStatus
} from '@cognite/sdk';
import { CYLINDER_RADIUS_MARGIN } from './utils/constants';
import { Box } from '../../base/utilities/primitives/Box';

export class Annotation {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public id: number = 0;
  public modelId: number = 0;
  public assetId: number | undefined = undefined;
  public status: AnnotationStatus = 'suggested';
  public confidence: number | undefined = undefined;
  public label: string | undefined = undefined;
  public primitives = new Array<Primitive>();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get hasAssetRef(): boolean {
    return this.assetId !== undefined;
  }

  public get resultingStatus(): AnnotationStatus {
    return this.hasAssetRef ? 'approved' : this.status;
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
          assetRef: { id: this.assetId }
        },
        annotatedResourceType: 'threedmodel',
        annotatedResourceId: this.modelId,
        annotationType: 'pointcloud.BoundingVolume',
        creatingApp: '3d-management',
        creatingAppVersion: '0.0.1',
        creatingUser: '3d-management'
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

  private static createCylinder(cylinder: Cylinder): AnnotationsCylinder {
    return {
      centerA: cylinder.centerA.toArray(),
      centerB: cylinder.centerB.toArray(),
      radius: cylinder.radius / (1 + CYLINDER_RADIUS_MARGIN),
      confidence: undefined,
      label: ''
    };
  }

  private static createBox(box: Box): AnnotationsBox {
    return {
      matrix: box.getMatrix().clone().transpose().elements,
      confidence: undefined,
      label: ''
    };
  }

  // private static async loadAnnotations(
  //   client: CogniteClient,
  //   modelId: number
  // ): Promise<Annotation[]> {
  //   const result = await client.annotations
  //     .list({
  //       filter: {
  //         annotatedResourceType: 'threedmodel',
  //         annotationType: 'pointcloud.BoundingVolume',
  //         annotatedResourceIds: [{ id: modelId }]
  //       },
  //       limit: 1000
  //     })
  //     .autoPagingToArray({ limit: Infinity });

  //   for (const annotation of result) {
  //     const primitives = new Array<Primitive>();
  //     for (const region of annotation.data.region) {
  //       if (region.cylinder) {
  //         primitives.push(new Cylinder(region.cylinder));
  //       } else if (region.box) {
  //         primitives.push(new Box(region.box));
  //       }
  //     }
  //     annotation.primitives = primitives;
  //   }
  //   return result;
  // }
}
