/*!
 * Copyright 2024 Cognite AS
 */

import { ExampleRenderStyle } from './ExampleRenderStyle';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { ExampleView } from './ExampleView';
import { PanelInfo } from '../../base/domainObjectsHelpers/PanelInfo';
import {
  type CreateDraggerProps,
  VisualDomainObject
} from '../../base/domainObjects/VisualDomainObject';
import { Vector3 } from 'three';
import { PopupStyle } from '../../base/domainObjectsHelpers/PopupStyle';
import { type BaseDragger } from '../../base/domainObjectsHelpers/BaseDragger';
import { ExampleDragger } from './ExampleDragger';
import { Quantity } from '../../base/domainObjectsHelpers/Quantity';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type Transaction } from '../../base/undo/Transaction';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { DomainObjectTransaction } from '../../base/undo/DomainObjectTransaction';

export class ExampleDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly center = new Vector3();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): ExampleRenderStyle {
    return super.getRenderStyle() as ExampleRenderStyle;
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return 'Circle';
  }

  public override get typeName(): TranslateKey {
    return { fallback: 'Example' };
  }

  public override get canBeRemoved(): boolean {
    return true;
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new ExampleRenderStyle();
  }

  public override createDragger(props: CreateDraggerProps): BaseDragger | undefined {
    return new ExampleDragger(props, this);
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    info.setHeader(this.typeName);
    // In production code, you should add a Key also!
    add('X coordinate', this.center.x, Quantity.Length);
    add('Y coordinate', this.center.y, Quantity.Length);
    add('Z coordinate', this.center.z, Quantity.Length);
    return info;

    function add(fallback: string, value: number, quantity: Quantity): void {
      info.add({ fallback, value, quantity });
    }
  }

  public override getPanelInfoStyle(): PopupStyle {
    return new PopupStyle({ bottom: 50, left: 0 });
  }

  public override createTransaction(changed: symbol): Transaction {
    return new DomainObjectTransaction(this, changed);
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new ExampleDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }

  public override copyFrom(domainObject: ExampleDomainObject, what?: symbol): void {
    super.copyFrom(domainObject, what);
    if (what === undefined || what === Changes.geometry) {
      this.center.copy(domainObject.center);
    }
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new ExampleView();
  }
}
