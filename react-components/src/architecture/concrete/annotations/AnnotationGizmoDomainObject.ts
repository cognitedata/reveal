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
import { getAnnotationMatrixByGeometry } from './utils/getMatrixUtils';
import { type PointCloudAnnotation } from './utils/types';
import { createPointCloudAnnotationFromMatrix } from './commands/CreateAnnotationMockCommand';

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
    style.opacity = 0.333;
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
      this.updateSelectedAnnotationFromThis();
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public createPointCloudAnnotation(): PointCloudAnnotation {
    const matrix = this.getMatrixForAnnotation();
    return createPointCloudAnnotationFromMatrix(matrix);
  }

  public updateThisFromAnnotation(annotation: PointCloudAnnotation): boolean {
    const geometry = getSingleAnnotationGeometry(annotation);
    if (geometry === undefined) {
      return false;
    }
    const matrix = getAnnotationMatrixByGeometry(geometry, 0);
    if (matrix === undefined) {
      return false;
    }
    if (geometry.box !== undefined) {
      matrix.scale(new Vector3(2, 2, 2));
    }
    if (geometry.cylinder !== undefined) {
      matrix.scale(new Vector3(2, 1, 2));
    }
    this.setMatrixFromAnnotation(matrix);
    return true;
  }

  private updateSelectedAnnotationFromThis(): void {
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
    if (geometry.box !== undefined) {
      const matrix = this.getMatrixForAnnotation();
      geometry.box.matrix = matrix.clone().transpose().elements;
      annotationDomainObject.notify(Changes.geometry);
    }
    if (geometry.cylinder !== undefined) {
      const matrix = this.getMatrixForAnnotation();

      const centerA = new Vector3(0, 1, 0).applyMatrix4(matrix);
      const centerB = new Vector3(0, -1, 0).applyMatrix4(matrix);
      const scale = new Vector3();
      matrix.decompose(new Vector3(), new Quaternion(), scale);

      geometry.cylinder.centerA = centerA.toArray();
      geometry.cylinder.centerB = centerB.toArray();
      geometry.cylinder.radius = scale.x;
      annotationDomainObject.notify(Changes.geometry);
    }
  }

  private getMatrixForAnnotation(matrix: Matrix4 = new Matrix4()): Matrix4 {
    const scale = this.size.clone().divideScalar(2);
    return this.getScaledMatrix(scale, matrix);
  }

  private setMatrixFromAnnotation(matrix: Matrix4): void {
    const scale = new Vector3();
    const position = new Vector3();
    const quaternion = new Quaternion();

    matrix.decompose(position, quaternion, scale);
    const euler = new Euler().setFromQuaternion(quaternion);

    this.size.copy(scale);
    this.center.copy(position);
    this.zRotation = forceBetween0AndPi(euler.z);
  }
}
