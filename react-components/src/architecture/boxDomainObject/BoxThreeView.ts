/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Mesh, MeshPhongMaterial, Object3D, BoxGeometry, Box3, DoubleSide } from 'three';
import { BoxDomainObject } from './BoxDomainObject';
import { DomainObjectChange } from '../utilities/misc/DomainObjectChange';
import { Changes } from '../utilities/misc/Changes';
import { Range3 } from '../utilities/geometry/Range3';
import { BoxRenderStyle } from './BoxRenderStyle';
import { ObjectThreeView } from '../views/ObjectThreeView';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';

export class BoxThreeView extends ObjectThreeView {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get boxDomainObject(): BoxDomainObject {
    return super.domainObject as BoxDomainObject;
  }

  protected get style(): BoxRenderStyle {
    return super.style as BoxRenderStyle;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (this._object3D === undefined) {
      return;
    }
    if (change.isChanged(Changes.renderStyle) || change.isChanged(Changes.color)) {
      const mesh = this._object3D as Mesh;
      if (mesh !== undefined) {
        updateMaterial(mesh.material as MeshPhongMaterial, this.boxDomainObject, this.style);
        this.invalidate();
      }
    }
  }

  // ==================================================
  // OVERRIDES of ThreeView
  // ==================================================

  public override calculateBoundingBox(): Range3 {
    const object = this.object3D;
    if (object === undefined) {
      return new Range3();
    }
    const box = new Box3();
    box.setFromObject(object);
    return new Range3(box.min, box.max);
  }

  // ==================================================
  // OVERRIDES of ObjectThreeView
  // ==================================================

  protected override createObject3D(): Object3D | undefined {
    const { boxDomainObject } = this;
    const { matrix } = boxDomainObject;
    const { style } = this;

    const material = new MeshPhongMaterial();
    updateMaterial(material, boxDomainObject, style);
    const geometry = new BoxGeometry(1, 1, 1);
    const mesh = new Mesh(geometry, material);

    matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
    mesh.applyMatrix4(matrix);
    return mesh;
  }
}

// ==================================================
// LOCAL FUNCTIONS
// ==================================================

function updateMaterial(
  material: MeshPhongMaterial,
  boxDomainObject: BoxDomainObject,
  style: BoxRenderStyle
): void {
  const color = boxDomainObject.getColorByColorType(style.colorType);
  material.color = color;
  material.opacity = style.opacityUse ? style.opacity : 1;
  material.transparent = style.opacityUse;
  material.emissive = color;
  material.emissiveIntensity = 0.2;
  material.side = DoubleSide;
  material.flatShading = true;
}
