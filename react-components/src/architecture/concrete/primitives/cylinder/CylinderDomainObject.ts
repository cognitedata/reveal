/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../../base/views/ThreeView';
import { CylinderView } from './CylinderView';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { CylinderDragger } from './CylinderDragger';
import { type CreateDraggerProps } from '../../../base/domainObjects/VisualDomainObject';
import { getIconByPrimitiveType } from '../../../base/utilities/primitives/getIconByPrimitiveType';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { PanelInfo } from '../../../base/domainObjectsHelpers/PanelInfo';
import { SolidDomainObject } from '../common/SolidDomainObject';
import { SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { Line3, Vector3 } from 'three';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { type IconName } from '../../../base/utilities/IconName';

export abstract class CylinderDomainObject extends SolidDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly cylinder = new Cylinder();

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): IconName {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get typeName(): TranslationInput {
    return { key: 'CYLINDER' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new SolidPrimitiveRenderStyle();
  }

  public override createDragger(props: CreateDraggerProps): BaseDragger | undefined {
    const pickInfo = props.intersection.userData as PrimitivePickInfo;
    if (pickInfo === undefined) {
      return undefined; // If the pickInfo isn't specified, no dragger is created
    }
    return new CylinderDragger(props, this);
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    info.setHeader(this.typeName);

    const { cylinder } = this;

    const isFinished = this.focusType !== FocusType.Pending;
    const hasRadius = Cylinder.isValidSize(cylinder.radius);
    const hasHeight = Cylinder.isValidSize(cylinder.height);

    if (isFinished || hasRadius) {
      add({ key: 'RADIUS' }, cylinder.radius, Quantity.Length);
    }
    if (isFinished || hasHeight) {
      add({ key: 'HEIGHT' }, cylinder.height, Quantity.Length);
    }
    if (isFinished || (hasRadius && hasHeight)) {
      add({ key: 'AREA' }, cylinder.area, Quantity.Area);
      add({ key: 'VOLUME' }, cylinder.volume, Quantity.Volume);
    }
    return info;

    function add(translationInput: TranslationInput, value: number, quantity: Quantity): void {
      info.add({ translationInput, value, quantity });
    }
  }

  public override copyFrom(domainObject: CylinderDomainObject, what?: symbol): void {
    super.copyFrom(domainObject, what);
    if (what === undefined || what === Changes.geometry) {
      this.cylinder.copy(domainObject.cylinder);
    }
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new CylinderView();
  }

  public override getEditToolCursor(
    renderTarget: RevealRenderTarget,
    point?: Vector3
  ): string | undefined {
    if (this.focusType === FocusType.Body) {
      return 'move';
    } else if (this.focusType === FocusType.Face) {
      if (this.focusFace === undefined) {
        return undefined;
      }
      const { cylinder } = this;
      if (this.focusFace.index === 2) {
        return renderTarget.getResizeCursor(cylinder.centerA, cylinder.centerB);
      } else {
        if (point === undefined) {
          return undefined;
        }
        const axis = new Line3(cylinder.centerA, cylinder.centerB);
        const closestOnAxis = axis.closestPointToPoint(point, false, new Vector3());
        return renderTarget.getResizeCursor(point, closestOnAxis);
      }
    } else if (this.focusType === FocusType.Rotation) {
      return 'grab';
    } else {
      return undefined;
    }
  }

  // ==================================================
  // OVERRIDES of SolidDomainObject
  // ==================================================

  public override get primitiveType(): PrimitiveType {
    return this.cylinder.primitiveType;
  }

  public override clear(): void {
    super.clear();
    this.cylinder.clear();
  }
}
