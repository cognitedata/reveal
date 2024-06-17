/*!
 * Copyright 2024 Cognite AS
 */

import { ExampleDomainObject } from './ExampleDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { ResetAllExamplesCommand } from './commands/ResetAllExamplesCommand';
import { DeleteAllExamplesCommand } from './commands/DeleteAllExamplesCommand';
import { ShowAllExamplesCommand } from './commands/ShowAllExamplesCommand';
import { clamp } from 'lodash';
import { type HSL } from 'three';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { ShowExamplesOnTopCommand } from './commands/ShowExamplesOnTopCommand';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';

export class ExampleTool extends BaseEditTool {
  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    return 'Circle';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Create or edit a single point' };
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onKey(event: KeyboardEvent, down: boolean): void {
    if (down && event.key === 'Delete') {
      const domainObject = this.getSelected();
      if (domainObject !== undefined) {
        domainObject.removeInteractive();
      }
      return;
    }
    super.onKey(event, down);
  }

  public override async onWheel(event: WheelEvent, delta: number): Promise<void> {
    const intersection = await this.getIntersection(event);
    const domainObject = this.getIntersectedSelectableDomainObject(
      intersection
    ) as ExampleDomainObject;
    if (domainObject === undefined || !domainObject.isSelected) {
      await super.onWheel(event, delta);
      return;
    }
    if (event.shiftKey) {
      // Change color
      let hsl: HSL = { h: 0, s: 0, l: 0 };
      hsl = domainObject.color.getHSL(hsl);
      hsl.h = (hsl.h + Math.sign(delta) * 0.02) % 1;
      domainObject.color.setHSL(hsl.h, hsl.s, hsl.l);
      domainObject.notify(Changes.color);
    } else if (event.ctrlKey) {
      // Change opacity
      const opacity = domainObject.renderStyle.opacity + Math.sign(delta) * 0.05;
      domainObject.renderStyle.opacity = clamp(opacity, 0.2, 1);
      domainObject.notify(new DomainObjectChange(Changes.renderStyle, 'opacity'));
    } else {
      // Change radius
      const factor = 1 - Math.sign(delta) * 0.1;
      domainObject.renderStyle.radius *= factor;
      domainObject.notify(new DomainObjectChange(Changes.renderStyle, 'radius'));
    }
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

  public override async onClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      await super.onClick(event);
      return;
    }
    {
      const domainObject = this.getIntersectedSelectableDomainObject(intersection);
      if (domainObject !== undefined) {
        this.deselectAll(domainObject);
        domainObject.setSelectedInteractive(true);
        return;
      }
    }
    const center = intersection.point.clone();
    const matrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
    center.applyMatrix4(matrix);

    const domainObject = new ExampleDomainObject();
    domainObject.center.copy(center);

    this.deselectAll();
    this.rootDomainObject.addChildInteractive(domainObject);
    domainObject.setVisibleInteractive(true, this.renderTarget);
    domainObject.setSelectedInteractive(true);
    this.renderTarget.setMoveCursor();
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new ResetAllExamplesCommand(),
      new ShowAllExamplesCommand(),
      new DeleteAllExamplesCommand(),
      new ShowExamplesOnTopCommand()
    ];
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof ExampleDomainObject;
  }
}
