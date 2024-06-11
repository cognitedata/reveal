/*!
 * Copyright 2024 Cognite AS
 */
import { Vector3 } from 'three';
import {
  type CreateDraggerProps,
  VisualDomainObject
} from '../../base/domainObjects/VisualDomainObject';
import { PointRenderStyle } from './PointRenderStyle';
import { PointView } from './PointView';
import { PanelInfo } from '../../base/domainObjectsHelpers/PanelInfo';
import { Quantity } from '../../base/domainObjectsHelpers/Quantity';
import { PopupStyle } from '../../base/domainObjectsHelpers/PopupStyle';
import { type BaseDragger } from '../../base/domainObjectsHelpers/BaseDragger';
import { PointDragger } from './PointDragger';

export class PointDomainObject extends VisualDomainObject {
  public center: Vector3;

  public renderStyle: PointRenderStyle;
  constructor() {
    super();
    this.center = new Vector3();
    this.renderStyle = new PointRenderStyle();
  }

  public override get icon(): string {
    return 'Circle';
  }

  public override get typeName(): string {
    return 'Point';
  }

  public override createThreeView(): PointView {
    return new PointView();
  }

  public override createRenderStyle(): PointRenderStyle {
    this.renderStyle = new PointRenderStyle();
    return this.renderStyle;
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    info.setHeader('NAME', this.name);
    add('X', 'X coordinate', this.center.x, Quantity.Length);
    add('Y', 'Y coordinate', this.center.y, Quantity.Length);
    add('Z', 'Z coordinate', this.center.z, Quantity.Length);

    return info;

    function add(key: string, fallback: string, value: number, quantity: Quantity): void {
      info.add({ key, fallback, value, quantity });
    }
  }

  public override getPanelInfoStyle(): PopupStyle {
    return new PopupStyle({ bottom: 60, left: 0 });
  }

  public override get canBeRemoved(): boolean {
    return false;
  }

  public override createDragger(_props: CreateDraggerProps): BaseDragger {
    return new PointDragger(_props, this);
  }
}
