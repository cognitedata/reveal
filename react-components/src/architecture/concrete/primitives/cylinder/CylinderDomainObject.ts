/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../../base/views/ThreeView';
import { CylinderView } from './CylinderView';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { CylinderDragger } from './CylinderDragger';
import { type CreateDraggerProps } from '../../../base/domainObjects/VisualDomainObject';
import { getIconByPrimitiveType } from '../../measurements/getIconByPrimitiveType';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { PanelInfo } from '../../../base/domainObjectsHelpers/PanelInfo';
import { SolidDomainObject } from '../common/SolidDomainObject';
import { SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';

export abstract class CylinderDomainObject extends SolidDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly cylinder = new Cylinder();

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get typeName(): TranslateKey {
    return { key: 'MEASUREMENTS_CYLINDER', fallback: 'Cylinder' };
  }

  public override get isLegal(): boolean {
    return this.focusType !== FocusType.Pending;
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
      add('MEASUREMENTS_RADIUS', 'Radius', cylinder.radius, Quantity.Length);
    }
    if (isFinished || hasHeight) {
      add('MEASUREMENTS_HEIGHT', 'Height', cylinder.height, Quantity.Length);
    }
    if (isFinished || (hasRadius && hasHeight)) {
      add('MEASUREMENTS_AREA', 'Area', cylinder.area, Quantity.Area);
      add('MEASUREMENTS_VOLUME', 'Volume', cylinder.volume, Quantity.Volume);
    }
    return info;

    function add(
      key: string | undefined,
      fallback: string,
      value: number,
      quantity: Quantity
    ): void {
      info.add({ key, fallback, value, quantity });
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

  // ==================================================
  // OVERRIDES of SolidDomainObject
  // ==================================================

  public override get primitiveType(): PrimitiveType {
    return PrimitiveType.Cylinder;
  }

  public override clear(): void {
    super.clear();
    this.cylinder.clear();
  }
}
