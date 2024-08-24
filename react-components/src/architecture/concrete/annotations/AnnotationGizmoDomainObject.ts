/*!
 * Copyright 2024 Cognite AS
 */

import { BoxDomainObject } from '../primitives/box/BoxDomainObject';
import { Color, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { BoxRenderStyle } from '../primitives/box/BoxRenderStyle';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { AnnotationsDomainObject } from './AnnotationsDomainObject';
import { getSingleAnnotationGeometry } from './utils/annotationGeometryUtils';
import { forceBetween0AndPi } from '../../base/utilities/extensions/mathExtensions';

export class AnnotationGizmoDomainObject extends BoxDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
    this.color = new Color(Color.NAMES.white);
  }
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslateKey {
    return { fallback: 'Annotation gizmo' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new BoxRenderStyle();
    style.showLabel = false;
    return style;
  }

  public override get hasPanelInfo(): boolean {
    return false;
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new AnnotationGizmoDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }

  protected override notifyCore(change: DomainObjectChange): void {
    super.notifyCore(change);

    if (change.isChanged(Changes.geometry)) {
      this.updateSelectedAnnotation();
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getMatrixForAnnotation(matrix: Matrix4 = new Matrix4()): Matrix4 {
    const scale = this.size.clone().divideScalar(2);
    return this.getScaledMatrix(scale, matrix);
  }

  public setMatrixFromAnnotation(matrix: Matrix4): void {
    const scale = new Vector3();
    const position = new Vector3();
    const quaternion = new Quaternion();

    // Decompose the matrix into position, quaternion (rotation), and scale
    matrix.decompose(position, quaternion, scale);

    scale.multiplyScalar(2);
    this.size.copy(scale);
    this.center.copy(position);

    const euler = new Euler().setFromRotationMatrix(matrix);
    this.zRotation = forceBetween0AndPi(euler.z);
  }

  private updateSelectedAnnotation(): void {
    const annotationDomainObject = this.getAncestorByType(AnnotationsDomainObject);
    if (annotationDomainObject === undefined) {
      return;
    }
    const annotation = annotationDomainObject.selectedAnnotation;
    if (annotation === undefined) {
      return;
    }
    const geometry = getSingleAnnotationGeometry(annotation);
    if (geometry === undefined) {
      return;
    }
    const box = geometry.box;
    if (box === undefined) {
      return;
    }
    const matrix = this.getMatrixForAnnotation();
    box.matrix = matrix.clone().transpose().elements;
    annotationDomainObject.notify(Changes.geometry);
  }
}
