/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';
import {
  type AnnotationsBox,
  type AnnotationsCylinder,
  type AnnotationsBoundingVolume
} from '@cognite/sdk/dist/src';
import { Matrix4, Vector3 } from 'three';
import { type PointCloudAnnotation } from '../utils/types';
import { InstanceCommand } from '../../../base/commands/InstanceCommand';
import { getRandomInt } from '../../../base/utilities/extensions/mathExtensions';

export class CreateAnnotationMockCommand extends InstanceCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): string {
    return 'Bug';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'ANNOTATIONS_CREATE', fallback: 'Create annotation' };
  }

  public override get isEnabled(): boolean {
    return !this.anyInstances;
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof AnnotationsDomainObject;
  }

  protected override invokeCore(): boolean {
    const { renderTarget, rootDomainObject } = this;
    let annotationDomainObject = this.getFirstInstance() as AnnotationsDomainObject;
    if (annotationDomainObject !== undefined) {
      return false;
    }
    annotationDomainObject = new AnnotationsDomainObject();
    annotationDomainObject.annotations = createMock();
    annotationDomainObject.setSelectedInteractive(true);
    rootDomainObject.addChildInteractive(annotationDomainObject);
    annotationDomainObject.setVisibleInteractive(true, renderTarget);
    return true;
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function createAnnotationsBox(matrix: Matrix4): AnnotationsBox {
  const box: AnnotationsBox = {
    confidence: 0.5,
    label: 'test',
    matrix: matrix.elements
  };
  return box;
}

function createAnnotationsCylinder(
  centerA: Vector3,
  centerB: Vector3,
  radius: number
): AnnotationsCylinder {
  const cylinder: AnnotationsCylinder = {
    confidence: 0.5,
    label: 'test',
    radius,
    centerA: centerA.toArray(),
    centerB: centerB.toArray()
  };
  return cylinder;
}

function createMock(): PointCloudAnnotation[] {
  const annotations: PointCloudAnnotation[] = [];

  const radius = 0.5;
  for (let i = 0; i < 14; i++) {
    const x = 2 * i + 2;
    const y = 2 * i;
    const centerA = new Vector3(x, y, 0);
    const centerB = centerA.clone();
    centerB.x += 4;
    const center = centerA.clone().add(centerB).multiplyScalar(0.5);

    const matrix = new Matrix4().makeTranslation(center);
    matrix.multiply(new Matrix4().makeScale(2, 0.5, 1));
    matrix.transpose();

    const geometry: AnnotationsBoundingVolume = {
      confidence: 0.5,
      label: 'test',
      region: [
        {
          cylinder: i % 2 === 0 ? createAnnotationsCylinder(centerA, centerB, radius) : undefined,
          box: i % 2 !== 0 ? createAnnotationsBox(matrix) : undefined
        }
      ]
    };
    const annotation: PointCloudAnnotation = {
      source: 'asset-centric',
      id: getRandomInt(),
      status: 'approved',
      geometry,
      assetRef: { source: 'asset-centric', id: getRandomInt() },
      creatingApp: '3d-management'
    };
    if (i % 3 === 0) {
      annotation.status = 'rejected';
    }
    if (i % 4 === 0) {
      annotation.status = 'suggested';
    }
    annotations.push(annotation);
  }
  return annotations;
}

export function createPointCloudAnnotationFromMatrix(matrix: Matrix4): PointCloudAnnotation {
  const boxMatrix = matrix.clone().transpose();
  const geometry: AnnotationsBoundingVolume = {
    confidence: 0.5,
    label: 'test',
    region: [
      {
        box: createAnnotationsBox(boxMatrix)
      }
    ]
  };
  const annotation: PointCloudAnnotation = {
    source: 'asset-centric',
    id: getRandomInt(),
    status: 'approved',
    geometry,
    assetRef: { source: 'asset-centric', id: 0 },
    creatingApp: '3d-management'
  };
  return annotation;
}
