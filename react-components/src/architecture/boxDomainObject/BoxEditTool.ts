/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { NavigationTool } from '../concreteTools/NavigationTool';
import { BoxDomainObject } from './BoxDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type Tooltip } from '../commands/BaseCommand';

export class BoxEditTool extends NavigationTool {
  _useNavigation = false;
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get shortCutKey(): string | undefined {
    return 'I';
  }

  public override get name(): string {
    return 'Info';
  }

  public override get icon(): string {
    return 'Cube';
  }

  public override get tooltip(): Tooltip {
    return { key: 'UNKNOWN', fallback: 'Create or edit a box' };
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;
    const { viewer } = renderTarget;

    const intersection = await viewer.getIntersectionFromPixel(event.offsetX, event.offsetY);
    if (intersection === null) {
      return;
    }
    const ANNOTATION_RADIUS_FACTOR = 0.2;

    const distance = intersection.distanceToCamera;
    const scale = (distance * ANNOTATION_RADIUS_FACTOR) / 2;
    const boxDomainObject = new BoxDomainObject();

    const center = intersection.point.clone();
    center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());

    boxDomainObject.scale.setScalar(scale);
    boxDomainObject.center.copy(center);

    rootDomainObject.addChildInteractive(boxDomainObject);
    boxDomainObject.setVisibleInteractive(true, renderTarget);
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    const { renderTarget } = this;
    const { viewer } = renderTarget;

    const rect = renderTarget.domElement.getBoundingClientRect();
    const point = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };
    const intersection = await viewer.getIntersectionFromPixel(point.offsetX, point.offsetY);
    if (intersection !== null) {
      this._useNavigation = false;
      return;
    }
    this._useNavigation = true;
    await super.onPointerDown(event, leftButton);
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    const { renderTarget } = this;
    const { viewer } = renderTarget;

    if (this._useNavigation) {
      await super.onPointerDrag(event, leftButton);
      return;
    }
    const rect = renderTarget.domElement.getBoundingClientRect();
    const point = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };
    const intersection = await viewer.getIntersectionFromPixel(point.offsetX, point.offsetY);
    if (intersection !== null) {
    }
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._useNavigation) {
      await super.onPointerUp(event, leftButton);
      return;
    }
    const { renderTarget } = this;
    const { viewer } = renderTarget;

    const rect = renderTarget.domElement.getBoundingClientRect();
    const point = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };
    const intersection = await viewer.getIntersectionFromPixel(point.offsetX, point.offsetY);
    if (intersection !== null) {
    }
  }
}
