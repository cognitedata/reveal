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
import { getAnyMeasureDomainObject, getMeasurementDomainObjects } from './MeasurementFunctions';
import { MeasureRenderStyle } from './MeasureRenderStyle';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import {
  MeasurementObjectInfo,
  addEventListenerToMeasureBoxDomainObject
} from './addEventListenerToBoxDomainObject';

export class MeasurementTool extends BaseEditTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _creator: BaseCreator | undefined = undefined;
  private readonly _measureType: MeasureType;
  private readonly _measurementChangeCallback?: (measurementInfo?: MeasurementObjectInfo) => void;

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(
    measureType: MeasureType,
    measurementChangeCallback?: (measurementInfo?: MeasurementObjectInfo) => void
  ) {
    super();
    this._measureType = measureType;
    this._measurementChangeCallback = measurementChangeCallback;
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override equals(other: BaseCommand): boolean {
    if (!(other instanceof MeasurementTool)) {
      return false;
    }
    return this._measureType === other._measureType;
  }

  public override get shortCutKey(): string | undefined {
    return 'I';
  }

  public override get icon(): string {
    switch (this._measureType) {
      case MeasureType.Line:
      case MeasureType.Polyline:
      case MeasureType.Polygon:
        return 'Ruler';
      case MeasureType.VerticalArea:
      case MeasureType.HorizontalArea:
      case MeasureType.Volume:
        return 'Cube';
      default:
        throw new Error('Unknown MeasureType type');
    }
  }

  public override get tooltip(): Tooltip {
    switch (this._measureType) {
      case MeasureType.Line:
        return {
          key: 'MEASUREMENTS_ADD_LINE',
          fallback:
            'Measure distance between two points. Click at the start point and the end point.'
        };
      case MeasureType.Polyline:
        return {
          key: 'MEASUREMENTS_ADD_POLYLINE',
          fallback:
            'Measure the length of a continuous polyline. Click at any number of points and end with Esc.'
        };
      case MeasureType.Polygon:
        return {
          key: 'MEASUREMENTS_ADD_POLYGON',
          fallback: 'Measure an area of a polygon. Click at least 3 points and end with Esc.'
        };
      case MeasureType.VerticalArea:
        return {
          key: 'MEASUREMENTS_ADD_VERTICAL_AREA',
          fallback: 'Measure rectangular vertical Area. Click at two points in a vertical plan.'
        };
      case MeasureType.HorizontalArea:
        return {
          key: 'MEASUREMENTS_ADD_HORIZONTAL_AREA',
          fallback:
            'Measure rectangular horizontal Area. Click at three points in a horizontal plan.'
        };
      case MeasureType.Volume:
        return {
          key: 'MEASUREMENTS_ADD_VOLUME',
          fallback:
            'Measure volume of a box. Click at three points in a horizontal plan and the fourth to give it height.'
        };
      default:
        throw new Error('Unknown MeasureType type');
    }
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onActivate(): void {
    super.onActivate();
    this._creator = undefined;
    this.setAllMeasurementsVisible(true);
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    this._creator = undefined;
    this.setAllMeasurementsVisible(false);
    this._measurementChangeCallback?.(undefined);
  }

  public override onKey(event: KeyboardEvent, down: boolean): void {
    if (down && event.key === 'Delete') {
      for (const domainObject of getMeasurementDomainObjects(this.renderTarget)) {
        if (!domainObject.isSelected) {
          continue;
        }
        domainObject.removeInteractive();
      }
      this._creator = undefined;
      return;
    }
    if (down && event.key === 'Escape') {
      const { _creator: creator } = this;
      if (creator !== undefined) {
        creator.handleEscape();
        this._creator = undefined;
        return;
      }
    }
    super.onKey(event, down);
  }

  public override async onHover(event: PointerEvent): Promise<void> {
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
      if (this.isAnyMeasurement(intersection)) {
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
    if (intersection === undefined || this.isAnyMeasurement(intersection)) {
      // Do not want to click on other measurments
      await super.onClick(event);
      return;
    }
    const ray = this.getRay(event);
    if (creator === undefined) {
      const creator = (this._creator = this.createCreator());
      if (creator instanceof MeasureBoxCreator) {
        addEventListenerToMeasureBoxDomainObject(
          creator.domainObject as MeasureBoxDomainObject,
          this._measurementChangeCallback
        );
      }
      if (creator.addPoint(ray, intersection.point, false)) {
        const { domainObject } = creator;
        initializeStyle(domainObject, renderTarget);
        rootDomainObject.addChildInteractive(domainObject);
        domainObject.setVisibleInteractive(true, renderTarget);
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

  private setAllMeasurementsVisible(visible: boolean): void {
    for (const domainObject of getMeasurementDomainObjects(this.renderTarget)) {
      domainObject.setVisibleInteractive(visible, this.renderTarget);
    }
  }

  private isAnyMeasurement(intersection: AnyIntersection): boolean {
    // Do not want to click on other boxes
    if (!isDomainObjectIntersection(intersection)) {
      return false;
    }
    const domainObject = intersection.domainObject;
    return (
      domainObject instanceof MeasureBoxDomainObject ||
      domainObject instanceof MeasureLineDomainObject
    );
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

  private createCreator(): BaseCreator {
    switch (this._measureType) {
      case MeasureType.Line:
      case MeasureType.Polyline:
      case MeasureType.Polygon:
        return new MeasureLineCreator(this._measureType);
      case MeasureType.HorizontalArea:
      case MeasureType.VerticalArea:
      case MeasureType.Volume:
        return new MeasureBoxCreator(this._measureType);
      default:
        throw new Error();
    }
  }
}

function initializeStyle(domainObject: DomainObject, renderTarget: RevealRenderTarget): void {
  const otherDomainObject = getAnyMeasureDomainObject(renderTarget);
  if (otherDomainObject === undefined) {
    return;
  }
  const otherStyle = otherDomainObject.getRenderStyle();
  if (!(otherStyle instanceof MeasureRenderStyle)) {
    return;
  }
  const style = domainObject.getRenderStyle();
  if (!(style instanceof MeasureRenderStyle)) {
    return;
  }
  style.depthTest = otherStyle.depthTest;
}
