/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { NavigationTool } from '../../base/concreteCommands/NavigationTool';
import { BoxDomainObject } from './BoxDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type Tooltip } from '../../base/commands/BaseCommand';
import { isDomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { BoxDragger } from '../../base/utilities/box/BoxDragger';
import { type BoxFace } from '../../base/utilities/box/BoxFace';
import { BoxFocusType } from '../../base/utilities/box/BoxFocusType';
import { BoxPickInfo } from '../../base/utilities/box/BoxPickInfo';

export class BoxEditTool extends NavigationTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _dragger: BoxDragger | undefined = undefined;

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get shortCutKey(): string | undefined {
    return 'I';
  }

  public override get icon(): string {
    return 'Cube';
  }

  public override get tooltip(): Tooltip {
    return { key: 'UNKNOWN', fallback: 'Create or edit a box' };
  }

  public override onActivate(): void {
    super.onActivate();
    this._dragger = undefined;
    this.setAllBoxesVisible(true);
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    this.setAllBoxesVisible(false);
  }

  public override onKey(event: KeyboardEvent, down: boolean): void {
    if (down && event.key === 'Delete') {
      for (const boxDomainObject of this.getAllBoxDomainObjects()) {
        if (!boxDomainObject.hasFocus) {
          continue;
        }
        boxDomainObject.removeInteractive();
      }
      return;
    }
    if (event.key === 'Control') {
      const focusType = down ? BoxFocusType.Scale : getFocusType(event);
      for (const boxDomainObject of this.getAllBoxDomainObjects()) {
        if (!boxDomainObject.hasFocus) {
          continue;
        }
        boxDomainObject.setFocusInteractive(focusType, boxDomainObject.focusFace);
      }
    }
    if (event.key === 'Shift') {
      const focusType = down ? BoxFocusType.Rotate : getFocusType(event);
      for (const boxDomainObject of this.getAllBoxDomainObjects()) {
        if (!boxDomainObject.hasFocus) {
          continue;
        }
        boxDomainObject.setFocusInteractive(focusType, boxDomainObject.focusFace);
      }
    }
    super.onKey(event, down);
  }

  public override onHover(event: PointerEvent): void {
    const intersection = this.getSpecificIntersection(event, BoxDomainObject);
    if (intersection === undefined) {
      this.setFocus(undefined);
      return;
    }
    if (!(intersection.domainObject instanceof BoxDomainObject)) {
      return;
    }
    this.setFocus(
      intersection.domainObject,
      getFocusType(event),
      intersection.userData as BoxPickInfo
    );
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;

    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      await super.onClick(event);
      return;
    }
    if (isDomainObjectIntersection(intersection)) {
      if (intersection.domainObject instanceof BoxDomainObject) {
        await super.onClick(event);
        return;
      }
    }
    const RADIUS_FACTOR = 0.2 * 5;
    const distance = intersection.distanceToCamera;
    const size = (distance * RADIUS_FACTOR) / 2;
    const boxDomainObject = new BoxDomainObject();

    const center = intersection.point.clone();
    center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());

    boxDomainObject.size.setScalar(size);
    boxDomainObject.center.copy(center);

    rootDomainObject.addChildInteractive(boxDomainObject);
    boxDomainObject.setVisibleInteractive(true, renderTarget);
    this.setFocus(boxDomainObject, BoxFocusType.Any);
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    this._dragger = await this.createDragInfo(event);
    if (this._dragger === undefined) {
      await super.onPointerDown(event, leftButton);
    } else {
      const boxDomainObject = this._dragger.domainObject as BoxDomainObject;
      this.setFocus(boxDomainObject, getFocusType(event), this._dragger.face);
    }
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._dragger === undefined) {
      await super.onPointerDrag(event, leftButton);
      return;
    }
    this._dragger.apply(getFocusType(event), this.getRaycaster(event).ray);
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._dragger === undefined) {
      await super.onPointerUp(event, leftButton);
    } else {
      this._dragger = undefined;
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private async createDragInfo(event: PointerEvent): Promise<BoxDragger | undefined> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      return undefined;
    }
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    const domainObject = intersection.domainObject;
    if (!(domainObject instanceof BoxDomainObject)) {
      return undefined;
    }
    const pickInfo = intersection.userData as BoxPickInfo;
    if (pickInfo === undefined) {
      return undefined;
    }
    return new BoxDragger(domainObject, intersection.point, pickInfo);
  }

  private setFocus(
    boxDomainObject: BoxDomainObject | undefined,
    type: BoxFocusType = BoxFocusType.None,
    face?: BoxFace
  ): void {
    for (const other of this.getAllBoxDomainObjects()) {
      if (boxDomainObject === undefined || other !== boxDomainObject) {
        other.setFocusInteractive(BoxFocusType.None);
      }
    }
    if (boxDomainObject !== undefined) {
      boxDomainObject.setFocusInteractive(type, face);
    }
  }

  private setAllBoxesVisible(visible: boolean): void {
    for (const boxDomainObject of this.getAllBoxDomainObjects()) {
      boxDomainObject.setVisibleInteractive(visible, this.renderTarget);
    }
  }

  public *getAllBoxDomainObjects(): Generator<BoxDomainObject> {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;
    for (const boxDomainObject of rootDomainObject.getDescendantsByType(BoxDomainObject)) {
      yield boxDomainObject;
    }
  }
}

function getFocusType(event: PointerEvent | KeyboardEvent): BoxFocusType {
  if (event.ctrlKey) {
    return BoxFocusType.Scale;
  }
  if (event.shiftKey) {
    return BoxFocusType.Rotate;
  }
  return BoxFocusType.Translate;
}
