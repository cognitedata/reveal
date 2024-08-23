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

  for (let i = 0; i < 14; i++) {
    const position = new Vector3(2 * i + 2, 2 * i, 0);
    const position2 = position.clone();
    position2.x += 4;

    const matrix = new Matrix4().makeTranslation(position);
    matrix.multiply(new Matrix4().makeScale(2, 0.5, 1));
    matrix.transpose();

    const geometry: AnnotationsBoundingVolume = {
      confidence: 0.5,
      label: 'test',
      region: [
        {
          cylinder: i % 2 === 0 ? createAnnotationsCylinder(position, position2, 0.5) : undefined,
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
  const m = matrix.clone().transpose();

  const geometry: AnnotationsBoundingVolume = {
    confidence: 0.5,
    label: 'test',
    region: [
      {
        box: createAnnotationsBox(m)
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
  return annotation;
}
