/*!
 * Copyright 2024 Cognite AS
 */

import { PrimitiveType } from '../primitives/PrimitiveType';
import { BoxDomainObject } from '../primitives/box/BoxDomainObject';
import { Color } from 'three';
import { getIconByPrimitiveType } from './getIconByPrimitiveType';
import { PanelInfo } from '../../base/domainObjectsHelpers/PanelInfo';
import { radToDeg } from 'three/src/math/MathUtils.js';
import { Quantity } from '../../base/domainObjectsHelpers/Quantity';
import { PopupStyle } from '../../base/domainObjectsHelpers/PopupStyle';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';

export const MIN_BOX_SIZE = 0.01;

export class MeasureBoxDomainObject extends BoxDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType) {
    super(primitiveType);
    this.color = new Color(Color.NAMES.magenta);
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get typeName(): string {
    switch (this.primitiveType) {
      case PrimitiveType.HorizontalArea:
        return 'Horizontal area';
      case PrimitiveType.VerticalArea:
        return 'Vertical area';
      case PrimitiveType.Box:
        return 'Volume';
      default:
        throw new Error('Unknown PrimitiveType');
    }
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfoStyle(): PopupStyle {
    // bottom = 66 because the toolbar is below
    return new PopupStyle({ bottom: 66, left: 0 });
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    const { primitiveType: type } = this;
    const isFinished = this.focusType !== FocusType.Pending;

    const hasX = BoxDomainObject.isValidSize(this.size.x);
    const hasY = BoxDomainObject.isValidSize(this.size.y);
    const hasZ = BoxDomainObject.isValidSize(this.size.z);

    switch (type) {
      case PrimitiveType.HorizontalArea:
        info.setHeader('MEASUREMENTS_HORIZONTAL_AREA', 'Horizontal area');
        break;
      case PrimitiveType.VerticalArea:
        info.setHeader('MEASUREMENTS_VERTICAL_AREA', 'Vertical area');
        break;
      case PrimitiveType.Box:
        info.setHeader('MEASUREMENTS_VOLUME', 'Volume');
        break;
    }
    if (isFinished || hasX) {
      add('MEASUREMENTS_LENGTH', 'Length', this.size.x, Quantity.Length);
    }
    if (type !== PrimitiveType.VerticalArea && (isFinished || hasY)) {
      add('MEASUREMENTS_DEPTH', 'Depth', this.size.y, Quantity.Length);
    }
    if (type !== PrimitiveType.HorizontalArea && (isFinished || hasZ)) {
      add('MEASUREMENTS_HEIGHT', 'Height', this.size.z, Quantity.Length);
    }
    if (type !== PrimitiveType.Box && (isFinished || this.hasArea)) {
      add('MEASUREMENTS_AREA', 'Area', this.area, Quantity.Area);
    }
    if (type === PrimitiveType.Box && (isFinished || this.hasHorizontalArea)) {
      add('MEASUREMENTS_HORIZONTAL_AREA', 'Horizontal area', this.horizontalArea, Quantity.Area);
    }
    if (type === PrimitiveType.Box && (isFinished || this.hasVolume)) {
      add('MEASUREMENTS_VOLUME', 'Volume', this.volume, Quantity.Volume);
    }
    // I forgot to add text for rotation angle before the deadline, so I used a icon instead.
    if (this.zRotation !== 0 && isFinished) {
      info.add({
        key: '',
        icon: 'Angle',
        value: radToDeg(this.zRotation),
        quantity: Quantity.Degrees
      });
    }
    return info;

    function add(key: string, fallback: string, value: number, quantity: Quantity): void {
      info.add({ key, fallback, value, quantity });
    }
  }
}
