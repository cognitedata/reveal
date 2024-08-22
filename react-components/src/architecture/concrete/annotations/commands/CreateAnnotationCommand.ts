/*!
 * Copyright 2024 Cognite AS
 */

import { ShowAllDomainObjectsCommand } from '../../../base/commands/ShowAllDomainObjectsCommand';
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

export class CreateAnnotationCommand extends ShowAllDomainObjectsCommand {
  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof AnnotationsDomainObject;
  }
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): string {
    return 'Cube';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Create annotation' };
  }

  public override get isEnabled(): boolean {
    return true;
  }

  protected override invokeCore(): boolean {
    const { renderTarget, rootDomainObject } = this;
    let annotationDomainObject = rootDomainObject.getDescendantByType(AnnotationsDomainObject);
    if (annotationDomainObject === undefined) {
      annotationDomainObject = new AnnotationsDomainObject();
      annotationDomainObject.annotations = createMock();
      annotationDomainObject.setSelectedInteractive(true);
      rootDomainObject.addChildInteractive(annotationDomainObject);
      annotationDomainObject.setVisibleInteractive(true, renderTarget);
      return true;
    }
    return super.invokeCore();
  }
}

function createMock(): PointCloudAnnotation[] {
  const annotations: PointCloudAnnotation[] = [];

  let id = 1000;
  for (let i = 0; i < 14; i++) {
    const position = new Vector3(2 * i + 2, 2 * i, 0);
    const position2 = position.clone();
    position2.x += 4;

    const matrix = new Matrix4().makeTranslation(position);
    matrix.multiply(new Matrix4().makeScale(2, 0.5, 1));
    matrix.transpose();

    const box: AnnotationsBox = {
      confidence: 0.5,
      label: 'test',
      matrix: matrix.elements
    };

    const cylinder: AnnotationsCylinder = {
      confidence: 0.5,
      label: 'test',
      radius: 0.8,
      centerA: position.toArray(),
      centerB: position2.toArray()
    };

    const geometry: AnnotationsBoundingVolume = {
      confidence: 0.5,
      label: 'test',
      region: [
        {
          cylinder: i % 2 === 0 ? cylinder : undefined,
          box: i % 2 !== 0 ? box : undefined
        }
      ]
    };
    id++;
    const annotation: PointCloudAnnotation = {
      source: 'asset-centric',
      id,
      status: 'approved',
      geometry,
      assetRef: { source: 'asset-centric', id: id * 33 },
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
