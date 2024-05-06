/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { NavigationTool } from '../../base/concreteCommands/NavigationTool';
import { BoxDomainObject } from './BoxDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type Tooltip } from '../../base/commands/BaseCommand';
import { isDomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { BoxDragInfo } from './BoxDragInfo';
import { type BoxFace } from './BoxFace';

export class BoxEditTool extends NavigationTool {
  private _dragInfo: BoxDragInfo | undefined = undefined;

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

  public onActivate(): void {
    this._dragInfo = undefined;
    this.setAllVisible(true);
  }

  public onDeactivate(): void {
    this.setAllVisible(false);
  }

  public onKey(event: KeyboardEvent, down: boolean): void {
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
      const focusTranslate = down;
      for (const boxDomainObject of this.getAllBoxDomainObjects()) {
        if (!boxDomainObject.hasFocus) {
          continue;
        }
        boxDomainObject.setFocusInteractive(true, boxDomainObject.focusFace, focusTranslate);
      }
    }
    super.onKey(event, down);
  }

  public onHover(event: PointerEvent): void {
    const intersection = this.getSpecificIntersection(event, BoxDomainObject);
    if (intersection === undefined) {
      this.setFocus(undefined);
      return;
    }
    if (!(intersection.domainObject instanceof BoxDomainObject)) {
      return;
    }
    this.setFocus(intersection.domainObject, intersection.userData as BoxFace, event.ctrlKey);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;

    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      return;
    }
    if (isDomainObjectIntersection(intersection)) {
      if (intersection.domainObject instanceof BoxDomainObject) {
        return;
      }
    }
    const RADIUS_FACTOR = 0.2;
    const distance = intersection.distanceToCamera;
    const size = (distance * RADIUS_FACTOR) / 2;
    const boxDomainObject = new BoxDomainObject();

    const center = intersection.point.clone();
    center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());

    boxDomainObject.size.setScalar(size);
    boxDomainObject.center.copy(center);

    rootDomainObject.addChildInteractive(boxDomainObject);
    boxDomainObject.setVisibleInteractive(true, renderTarget);
    this.setFocus(boxDomainObject);
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    this._dragInfo = await this.createDragInfo(event);
    if (this._dragInfo === undefined) {
      await super.onPointerDown(event, leftButton);
    } else {
      this.setFocus(this._dragInfo.boxDomainObject, this._dragInfo.face, event.ctrlKey);
    }
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._dragInfo === undefined) {
      await super.onPointerDrag(event, leftButton);
      return;
    }
    const ray = this.getRaycaster(event).ray;
    if (event.ctrlKey) {
      this._dragInfo.translate(ray);
    } else {
      this._dragInfo.scale(ray);
    }
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._dragInfo === undefined) {
      await super.onPointerUp(event, leftButton);
    } else {
      this._dragInfo = undefined;
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private async createDragInfo(event: PointerEvent): Promise<BoxDragInfo | undefined> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      return undefined;
    }
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    if (!(intersection.domainObject instanceof BoxDomainObject)) {
      return undefined;
    }
    const face = intersection.userData as BoxFace;
    if (face === undefined) {
      return undefined;
    }
    return new BoxDragInfo(event, intersection);
  }

  private setFocus(
    boxDomainObject: BoxDomainObject | undefined,
    face?: BoxFace,
    translate = false
  ): void {
    for (const other of this.getAllBoxDomainObjects()) {
      if (boxDomainObject === undefined || other !== boxDomainObject) {
        other.setFocusInteractive(false);
      }
    }
    if (boxDomainObject !== undefined) {
      boxDomainObject.setFocusInteractive(true, face, translate);
    }
  }

  private setAllVisible(visible: boolean): void {
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
