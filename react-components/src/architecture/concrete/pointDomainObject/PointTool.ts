/*!
 * Copyright 2024 Cognite AS
 */
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PointDomainObject } from './PointDomainObject';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type HSL } from 'three';
import { clamp } from 'lodash';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { ResetAllPointsCommand } from './ResetAllPointsCommand';
import { DeleteAllPointsCommand } from './DeleteAllPointsCommand';
import { ShowPointsOnTopCommand } from './ShowPointsOnTopCommand';
import { ShowAllPointCommand } from './ShowAllPointCommand';

export class PointTool extends BaseEditTool {
  public override get icon(): string {
    return 'Circle';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'ExampleToolTip', fallback: 'Create or edit a single point' };
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      await super.onClick(event);
      return;
    }

    const selectableDomainObject = this.getIntersectedSelectableDomainObject(intersection);
    if (selectableDomainObject !== undefined) {
      this.deselectAll(selectableDomainObject);
      selectableDomainObject.setSelectedInteractive(true);
      return;
    }

    const center = intersection.point.clone();
    const matrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
    center.applyMatrix4(matrix);

    const domainObject = new PointDomainObject();
    domainObject.center.copy(center);

    this.rootDomainObject.addChildInteractive(domainObject);
    domainObject.setVisibleInteractive(true, this.renderTarget);
    this.renderTarget.setMoveCursor();
  }

  public override async onHover(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    // Just set the cursor
    if (this.getIntersectedSelectableDomainObject(intersection) !== undefined) {
      this.renderTarget.setMoveCursor();
    } else if (intersection !== undefined) {
      this.renderTarget.setCrosshairCursor();
    } else {
      this.renderTarget.setNavigateCursor();
    }
  }

  public override onKey(event: KeyboardEvent, down: boolean): void {
    const domainObject = this.getSelected() as PointDomainObject;
    if (down && event.key === 'Delete') {
      if (domainObject !== undefined) {
        domainObject.removeInteractive(true);
      }
      return;
    }
    if (event.shiftKey) {
      domainObject.renderStyle.radius = 1;
      domainObject.notify(new DomainObjectChange(Changes.renderStyle, 'radius'));
    } else if (event.ctrlKey) {
      // .... paste code here
    } else {
      // .... paste code here
    }
    super.onKey(event, down);
  }

  public override async onWheel(event: WheelEvent, delta: number): Promise<void> {
    const intersection = await this.getIntersection(event);
    const domainObject = this.getIntersectedSelectableDomainObject(
      intersection
    ) as PointDomainObject;
    if (domainObject === undefined || !domainObject.isSelected) {
      await super.onWheel(event, delta);
      return;
    }
    // Change radius
    const factor = 1 - Math.sign(event.deltaY) * 0.1;
    domainObject.renderStyle.radius *= factor;
    domainObject.notify(new DomainObjectChange(Changes.renderStyle, 'radius'));

    let hsl: HSL = { h: 0, s: 0, l: 0 };
    hsl = domainObject.color.getHSL(hsl);
    hsl.h = (hsl.h + Math.sign(event.deltaY) * 0.02) % 1;
    domainObject.color.setHSL(hsl.h, hsl.s, hsl.l);
    domainObject.notify(Changes.color);

    const changedDelta = Math.sign(event.deltaY) * 0.05;
    domainObject.renderStyle.opacity = clamp(
      domainObject.renderStyle.opacity + changedDelta,
      0.2,
      1
    );
    domainObject.notify(new DomainObjectChange(Changes.renderStyle, 'opacity'));
  }

  public override canBeSelected(_domainObject: VisualDomainObject): boolean {
    return _domainObject instanceof PointDomainObject;
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new ResetAllPointsCommand(),
      new DeleteAllPointsCommand(),
      new ShowPointsOnTopCommand(),
      new ShowAllPointCommand()
    ];
  }
}
