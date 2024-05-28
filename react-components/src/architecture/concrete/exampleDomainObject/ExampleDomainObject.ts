/*!
 * Copyright 2024 Cognite AS
 */

import { ExampleRenderStyle } from './ExampleRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { ExampleView } from './ExampleView';
import { NumberType, PanelInfo } from '../../base/domainObjectsHelpers/PanelInfo';
import {
  type CreateDraggerProps,
  VisualDomainObject
} from '../../base/domainObjects/VisualDomainObject';
import { Vector3 } from 'three';
import { PopupStyle } from '../../base/domainObjectsHelpers/PopupStyle';
import { DomainObjectPanelUpdater } from '../../base/reactUpdaters/DomainObjectPanelUpdater';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type BaseDragger } from '../../base/domainObjectsHelpers/BaseDragger';
import { ExampleDragger } from './ExampleDragger';

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

  public override get canBeRemoved(): boolean {
    return true;
  }

  public override get icon(): string {
    return 'Circle';
  }

  public override get typeName(): string {
    return 'Example';
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new ExampleRenderStyle();
  }

  public override createDragger(props: CreateDraggerProps): BaseDragger | undefined {
    return new ExampleDragger(props, this);
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    info.setHeader('NAME', this.name);
    add('XCORDINATE', 'X coordinate', this.center.x, NumberType.Length);
    add('YCORDINATE', 'Y coordinate', this.center.y, NumberType.Length);
    add('ZCORDINATE', 'Z coordinate', this.center.z, NumberType.Length);
    return info;

    function add(key: string, fallback: string, value: number, numberType: NumberType): void {
      info.add({ key, fallback, value, numberType });
    }
  }

  public override getPanelInfoStyle(): PopupStyle {
    // bottom = 66 because the measurement toolbar is below
    return new PopupStyle({ bottom: 66, left: 0 });
  }

  protected override notifyCore(change: DomainObjectChange): void {
    super.notifyCore(change);

    if (!DomainObjectPanelUpdater.isActive) {
      return;
    }
    if (this.isSelected) {
      if (change.isChanged(Changes.deleted)) {
        DomainObjectPanelUpdater.update(undefined);
      }
      if (change.isChanged(Changes.selected, Changes.geometry, Changes.naming)) {
        DomainObjectPanelUpdater.update(this);
      }
    } else {
      if (change.isChanged(Changes.selected)) {
        DomainObjectPanelUpdater.update(undefined); // Deselected
      }
    }
  }
  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new ExampleView();
  }
}
