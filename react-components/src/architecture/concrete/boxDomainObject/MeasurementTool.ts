/*!
 * Copyright 2024 Cognite AS
 */

import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';
import { type AnyIntersection, CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type BaseCommand, type Tooltip } from '../../base/commands/BaseCommand';
import { isDomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { BoxFocusType } from '../../base/utilities/box/BoxFocusType';
import { type BoxPickInfo } from '../../base/utilities/box/BoxPickInfo';
import { type Vector3 } from 'three';
import { MeasureBoxCreator } from './MeasureBoxCreator';
import { MeasureType } from './MeasureType';
import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { MeasureLineCreator } from './MeasureLineCreator';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';
import { getAnyMeasureDomainObject, getMeasureDomainObjects } from './MeasurementFunctions';
import { MeasureRenderStyle } from './MeasureRenderStyle';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { MeasureDomainObject } from './MeasureDomainObject';
import { ShowMeasurmentsOnTopCommand } from './ShowMeasurmentsOnTopCommand';
import { SetMeasurmentTypeCommand } from './SetMeasurmentTypeCommand';
import { PopupStyle } from '../../base/domainObjectsHelpers/PopupStyle';

export class MeasurementTool extends BaseEditTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _creator: BaseCreator | undefined = undefined;
  public measureType: MeasureType = MeasureType.Line;

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    return 'Ruler';
  }

  public override get tooltip(): Tooltip {
    return { key: 'MEASUREMENTS', fallback: 'Measurements' };
  }

  public override getExtraToolbar(): Array<BaseCommand | undefined> | undefined {
    const result = new Array<BaseCommand | undefined>();
    result.push(new SetMeasurmentTypeCommand(MeasureType.Line));
    result.push(new SetMeasurmentTypeCommand(MeasureType.Polyline));
    result.push(new SetMeasurmentTypeCommand(MeasureType.Polygon));
    result.push(new SetMeasurmentTypeCommand(MeasureType.HorizontalArea));
    result.push(new SetMeasurmentTypeCommand(MeasureType.VerticalArea));
    result.push(new SetMeasurmentTypeCommand(MeasureType.Volume));
    result.push(undefined); // Means separator
    result.push(new ShowMeasurmentsOnTopCommand());
    return result;
  }

  public override getExtraToolbarStyle(): PopupStyle {
    return new PopupStyle({ bottom: 0, left: 0 });
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onActivate(): void {
    super.onActivate();
    this.setAllMeasurementsVisible(true);
  }

  public override onDeactivate(): void {
    this.handleEscape();
    super.onDeactivate();
    this.setAllMeasurementsVisible(false);
    this.deselectAll();
  }

  public override clearDragging(): void {
    super.clearDragging();
    this._creator = undefined;
  }

  public override onKey(event: KeyboardEvent, down: boolean): void {
    if (down && event.key === 'Delete') {
      for (const domainObject of getMeasureDomainObjects(this.renderTarget)) {
        if (!domainObject.isSelected) {
          continue;
        }
        domainObject.removeInteractive();
      }
      this._creator = undefined;
      return;
    }
    if (down && event.key === 'Escape') {
      this.handleEscape();
    }
    super.onKey(event, down);
  }

  public override async onHover(event: PointerEvent): Promise<void> {
    if (this.measureType === MeasureType.None) {
      this.renderTarget.setNavigateCursor();
      super.onHover(event);
      return;
    }

    const { _creator: creator } = this;
    if (creator !== undefined && !creator.preferIntersection) {
      // Hover in the "air"
      const ray = this.getRay(event);
      if (creator.addPoint(ray, undefined, true)) {
        this.setDefaultCursor();
        return;
      }
    }
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      if (creator !== undefined && creator.preferIntersection) {
        // Hover in the "air"
        const ray = this.getRay(event);
        if (creator.addPoint(ray, undefined, true)) {
          this.setDefaultCursor();
          return;
        }
      }
      this.renderTarget.setNavigateCursor();
      super.onHover(event);
      return;
    }
    if (creator !== undefined) {
      if (this.isMeasurement(intersection)) {
        return;
      }
      const ray = this.getRay(event);
      if (creator.addPoint(ray, intersection.point, true)) {
        this.setDefaultCursor();
        return;
      }
      return;
    }
    if (!isDomainObjectIntersection(intersection)) {
      this.setDefaultCursor();
      this.deselectAll();
      return;
    }
    const domainObject = intersection.domainObject;
    if (domainObject === undefined) {
      this.setDefaultCursor();
      this.deselectAll();
      return;
    }
    if (domainObject instanceof MeasureLineDomainObject) {
      this.deselectAll(domainObject);
      domainObject.setSelectedInteractive(true);
    } else if (domainObject instanceof MeasureBoxDomainObject) {
      this.deselectAll(domainObject);
      const pickInfo = intersection.userData as BoxPickInfo;
      if (pickInfo === undefined) {
        this.setDefaultCursor();
        return;
      }
      this.setCursor(domainObject, intersection.point, pickInfo);
      domainObject.setSelectedInteractive(true);
      domainObject.setFocusInteractive(pickInfo.focusType, pickInfo.face);
    }
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;

    const { _creator: creator } = this;
    // Click in the "air"
    if (creator !== undefined && !creator.preferIntersection) {
      const ray = this.getRay(event);
      if (creator.addPoint(ray, undefined, false)) {
        if (creator.isFinished) {
          this._creator = undefined;
        }
        return;
      }
    }
    // Click at "something"
    const intersection = await this.getIntersection(event);
    if (intersection === undefined || this.isMeasurement(intersection)) {
      // Do not want to click on other measurments
      await super.onClick(event);
      return;
    }
    const ray = this.getRay(event);
    if (creator === undefined) {
      const creator = (this._creator = this.createCreator());
      if (creator === undefined) {
        await super.onClick(event);
        return;
      }
      if (creator.addPoint(ray, intersection.point, false)) {
        const { domainObject } = creator;
        initializeStyle(domainObject, renderTarget);
        this.deselectAll();
        rootDomainObject.addChildInteractive(domainObject);
        domainObject.setSelectedInteractive(true);
        domainObject.setVisibleInteractive(true, renderTarget);
        this.renderTarget.toolController.update();
      }
    } else {
      if (creator.addPoint(ray, intersection.point, false)) {
        if (creator.isFinished) {
          this._creator = undefined;
        }
      }
    }
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._creator !== undefined) {
      return; // Prevent draggin while creating the new
    }
    await super.onPointerDown(event, leftButton);
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public handleEscape(): void {
    if (this._creator === undefined) {
      return;
    }
    this._creator.handleEscape();
    this._creator = undefined;
  }

  private setAllMeasurementsVisible(visible: boolean): void {
    for (const domainObject of getMeasureDomainObjects(this.renderTarget)) {
      domainObject.setVisibleInteractive(visible, this.renderTarget);
    }
  }

  private isMeasurement(intersection: AnyIntersection): boolean {
    // Do not want to click on other boxes
    if (!isDomainObjectIntersection(intersection)) {
      return false;
    }
    return intersection.domainObject instanceof MeasureDomainObject;
  }

  private setCursor(
    boxDomainObject: MeasureBoxDomainObject,
    point: Vector3,
    pickInfo: BoxPickInfo
  ): void {
    if (pickInfo.focusType === BoxFocusType.Body) {
      this.renderTarget.setMoveCursor();
    } else if (pickInfo.focusType === BoxFocusType.Face) {
      const matrix = boxDomainObject.getMatrix();
      matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

      const boxCenter = boxDomainObject.center.clone();
      const faceCenter = pickInfo.face.getCenter().multiplyScalar(100);
      const size = boxDomainObject.size.getComponent(pickInfo.face.index);
      if (size < 1) {
        // If they are too close, the pixel value will be the same, so multiply faceCenter
        // so it pretend the size is at least 1.
        faceCenter.multiplyScalar(1 / size);
      }
      boxCenter.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
      faceCenter.applyMatrix4(matrix);

      this.renderTarget.setResizeCursor(boxCenter, faceCenter);
    } else if (pickInfo.focusType === BoxFocusType.Corner) {
      const matrix = boxDomainObject.getMatrix();
      matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

      const faceCenter = pickInfo.face.getCenter();
      faceCenter.applyMatrix4(matrix);

      this.renderTarget.setResizeCursor(point, faceCenter);
    } else if (pickInfo.focusType === BoxFocusType.RotationRing) {
      this.renderTarget.setGrabCursor();
    } else {
      this.setDefaultCursor();
    }
  }

  private createCreator(): BaseCreator | undefined {
    switch (this.measureType) {
      case MeasureType.Line:
      case MeasureType.Polyline:
      case MeasureType.Polygon:
        return new MeasureLineCreator(this.measureType);
      case MeasureType.HorizontalArea:
      case MeasureType.VerticalArea:
      case MeasureType.Volume:
        return new MeasureBoxCreator(this.measureType);
      default:
        return undefined;
    }
  }
}

function initializeStyle(domainObject: DomainObject, renderTarget: RevealRenderTarget): void {
  const otherDomainObject = getAnyMeasureDomainObject(renderTarget);
  if (otherDomainObject === undefined) {
    return;
  }
  const otherStyle = otherDomainObject.renderStyle;
  const style = domainObject.getRenderStyle();
  if (!(style instanceof MeasureRenderStyle)) {
    return;
  }
  style.depthTest = otherStyle.depthTest;
}
