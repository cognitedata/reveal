/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';
import { Euler, Matrix4, Vector3 } from 'three';
import { InstanceCommand } from '../../../base/commands/InstanceCommand';
import { getRandomInt } from '../../../base/utilities/extensions/mathExtensions';
import { degToRad } from 'three/src/math/MathUtils.js';
import { type DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { AnnotationChangedDescription } from '../helpers/AnnotationChangedDescription';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { Annotation } from '../helpers/Annotation';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { Box } from '../../../base/utilities/primitives/Box';
import { type IconName } from '../../../base/utilities/IconName';

export class AnnotationsCreateMockCommand extends InstanceCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): IconName {
    return 'Bug';
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Create a mock annotation' };
  }

  public override get isEnabled(): boolean {
    return !this.anyInstances;
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof AnnotationsDomainObject;
  }

  protected override invokeCore(): boolean {
    const isMultiple = true;
    const { renderTarget, rootDomainObject } = this;
    let annotationDomainObject = this.getFirstInstance() as AnnotationsDomainObject;
    if (annotationDomainObject !== undefined) {
      return false;
    }
    annotationDomainObject = new AnnotationsDomainObject();
    annotationDomainObject.applyPendingWhenCreated = true;
    annotationDomainObject.annotations = isMultiple
      ? createMultiAnnotations()
      : createSingleAnnotations();
    annotationDomainObject.setSelectedInteractive(true);
    rootDomainObject.addChildInteractive(annotationDomainObject);
    annotationDomainObject.setVisibleInteractive(true, renderTarget);
    annotationDomainObject.views.addEventListener(onAnnotationChanged);
    return true;
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function createBox(matrix: Matrix4): Box {
  const box = new Box();
  box.setMatrix(matrix);
  return box;
}

function createCylinder(centerA: Vector3, centerB: Vector3, radius: number): Cylinder {
  const cylinder = new Cylinder();
  cylinder.radius = radius;
  cylinder.centerA.copy(centerA);
  cylinder.centerB.copy(centerB);
  return cylinder;
}

function createSingleAnnotations(): Annotation[] {
  const annotations: Annotation[] = [];

  const radius = 1;
  for (let i = 0; i < 14; i++) {
    const x = 2 * i + 2;
    const y = 2 * i;
    const centerA = new Vector3(x, y, 0);
    const centerB = centerA.clone();
    centerB.x += 4;
    const center = new Vector3().addVectors(centerA, centerB).divideScalar(2);

    const matrix = new Matrix4().makeTranslation(center);
    matrix.multiply(new Matrix4().makeRotationFromEuler(new Euler(degToRad(0), 0, degToRad(0))));

    matrix.multiply(new Matrix4().makeScale(4, 1, 2));

    const annotation = new Annotation();
    annotation.id = getRandomInt();
    annotation.label = 'test';
    if (i % 2 !== 0) {
      annotation.primitives.push(createCylinder(centerA, centerB, radius));
    } else {
      annotation.primitives.push(createBox(matrix));
    }
    if (i % 3 === 0) {
      annotation.status = 'rejected';
    } else if (i % 3 === 1) {
      annotation.status = 'suggested';
    } else {
      annotation.status = 'approved';
      annotation.setAssetRefId(getRandomInt());
    }
    annotations.push(annotation);
  }
  return annotations;
}

function createMultiAnnotations(): Annotation[] {
  const annotations: Annotation[] = [];

  const radius = 0.5;
  for (let i = 0; i < 6; i++) {
    const x = 4 * i + 2;
    const y = 4 * i;
    const centerA = new Vector3(x, y, 0);
    const centerB = centerA.clone();
    centerB.x += 4;
    const cylinder1 = createCylinder(centerA, centerB, radius);

    centerA.x += 4;
    centerB.x = centerA.x + 2;
    const center = centerA.clone().add(centerB).multiplyScalar(0.5);

    const matrix = new Matrix4().makeTranslation(center);
    matrix.multiply(new Matrix4().makeScale(1, 2, 1));
    const box = createBox(matrix);

    centerA.x += 2;
    centerB.x = centerA.x + 6;
    const cylinder2 = createCylinder(centerA, centerB, 2 * radius);

    const annotation = new Annotation();
    annotation.id = getRandomInt();
    annotation.label = 'test';
    annotation.primitives.push(cylinder1, box, cylinder2);
    if (i % 3 === 0) {
      annotation.status = 'rejected';
    } else if (i % 3 === 1) {
      annotation.status = 'suggested';
    } else {
      annotation.status = 'approved';
      annotation.setAssetRefId(getRandomInt());
    }
    annotations.push(annotation);
  }
  return annotations;
}

function onAnnotationChanged(domainObject: DomainObject, change: DomainObjectChange): void {
  if (!(domainObject instanceof AnnotationsDomainObject)) {
    return;
  }
  const description = change.getChangedDescriptionByType(AnnotationChangedDescription);
  if (description instanceof AnnotationChangedDescription) {
    // This is the changed annotation
    const _annotation = description.annotation;

    // This gives the changed geometry of the annotation.
    // if undefined all geometry has changed. You may want to save the whole annotation anyway.
    const _geometry = description.annotation.selectedPrimitive;

    if (description.change === Changes.changedPart) {
      // console.log('Change annotation');
    }
    if (description.change === Changes.dragging) {
      // console.log('Dragging');
    } else if (description.change === Changes.deletedPart) {
      // console.log('Delete annotation');
    } else if (description.change === Changes.addedPart) {
      // console.log('Add annotation');
    }
  }
  if (change.isChanged(Changes.newPending)) {
    // console.log('New pending annotation');
    // const annotation = domainObject.pendingAnnotation;
    // Call domainObject.applyPendingAnnotationInteractive() when ready
  }
  if (change.isChanged(Changes.selected)) {
    // Selection has change. Get selection by: (undefined if not any)
    const _annotation = domainObject.selectedAnnotation;
    // console.log('Selected has changed');
  }
  if (change.isChanged(Changes.focus)) {
    // Focus has change. Get focus by: (undefined if not any)
    const _annotation = domainObject.focusAnnotation;
    // console.log('Focus has changed');
  }
}
