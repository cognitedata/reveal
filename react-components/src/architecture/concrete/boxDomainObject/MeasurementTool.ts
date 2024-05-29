/*!
 * Copyright 2024 Cognite AS
 */

import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';
import { type AnyIntersection, CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type BaseCommand, type Tooltip } from '../../base/commands/BaseCommand';
import { isDomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { type BoxPickInfo } from '../../base/utilities/box/BoxPickInfo';
import { type Vector3 } from 'three';
import { MeasureBoxCreator } from './MeasureBoxCreator';
import { MeasureType } from './MeasureType';
import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { MeasureLineCreator } from './MeasureLineCreator';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';
import { MeasureRenderStyle } from './MeasureRenderStyle';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { MeasureDomainObject } from './MeasureDomainObject';
import { ShowMeasurmentsOnTopCommand } from './ShowMeasurmentsOnTopCommand';
import { SetMeasurmentTypeCommand } from './SetMeasurmentTypeCommand';
import { PopupStyle } from '../../base/domainObjectsHelpers/PopupStyle';
import { type RootDomainObject } from '../../base/domainObjects/RootDomainObject';
import { CommandsUpdater } from '../../base/reactUpdaters/CommandsUpdater';

export class MeasurementTool extends BaseEditTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _creator: BaseCreator | undefined = undefined;
  public measureType: MeasureType = MeasureType.None; // Default none, let the user decide

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    return 'Ruler';
  }

  public override get tooltip(): Tooltip {
    return { key: 'MEASUREMENTS', fallback: 'Measurements' };
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new SetMeasurmentTypeCommand(MeasureType.Line),
      new SetMeasurmentTypeCommand(MeasureType.Polyline),
      new SetMeasurmentTypeCommand(MeasureType.Polygon),
      new SetMeasurmentTypeCommand(MeasureType.HorizontalArea),
      new SetMeasurmentTypeCommand(MeasureType.VerticalArea),
      new SetMeasurmentTypeCommand(MeasureType.Volume),
      undefined, // Separator
      new ShowMeasurmentsOnTopCommand()
    ];
  }

  public override getToolbarStyle(): PopupStyle {
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
    this.setAllMeasurementsVisible(false);
    super.onDeactivate();
  }

  public override clearDragging(): void {
    super.clearDragging();
    this._creator = undefined;
  }

  public override onKey(event: KeyboardEvent, down: boolean): void {
    if (down && event.key === 'Delete') {
      const domainObject = this.rootDomainObject.getSelectedDescendantByType(MeasureDomainObject);
      if (domainObject !== undefined) {
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
    // Handle when creator is set first
    if (this.measureType !== MeasureType.None && this._creator !== undefined) {
      const { _creator: creator } = this;
      if (!creator.preferIntersection) {
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
        return;
      }
      if (this.getMeasurement(intersection) !== undefined) {
        this.renderTarget.setNavigateCursor();
        return;
      }
      const ray = this.getRay(event);
      if (creator.addPoint(ray, intersection, true)) {
        this.setDefaultCursor();
        return;
      }
      this.renderTarget.setNavigateCursor();
      return;
    }
    const intersection = await this.getIntersection(event);
    const domainObject = this.getMeasurement(intersection);
    if (!isDomainObjectIntersection(intersection) || domainObject === undefined) {
      this.defocusAll();
      if (this.measureType === MeasureType.None || intersection === undefined) {
        this.renderTarget.setNavigateCursor();
      } else {
        this.setDefaultCursor();
      }
      return;
    }
    // Set focus on the hovered object
    if (domainObject instanceof MeasureLineDomainObject) {
      this.defocusAll(domainObject);
      domainObject.setFocusInteractive(FocusType.Focus);
      this.renderTarget.setDefaultCursor();
    } else if (domainObject instanceof MeasureBoxDomainObject) {
      const pickInfo = intersection.userData as BoxPickInfo;
      if (pickInfo === undefined) {
        this.defocusAll();
        this.renderTarget.setDefaultCursor();
        return;
      }
      this.setCursor(domainObject, intersection.point, pickInfo);
      this.defocusAll(domainObject);
      domainObject.setFocusInteractive(pickInfo.focusType, pickInfo.face);
    }
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget, rootDomainObject } = this;

    const { _creator: creator } = this;
    // Click in the "air"
    if (creator !== undefined && !creator.preferIntersection) {
      const ray = this.getRay(event);
      if (creator.addPoint(ray, undefined)) {
        if (creator.isFinished) {
          this._creator = undefined;
          this.measureType = MeasureType.None;
          CommandsUpdater.update(renderTarget);
        }
        return;
      }
    }
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      // Click in the "air"
      await super.onClick(event);
      return;
    }
    const measurment = this.getMeasurement(intersection);
    if (measurment !== undefined) {
      this.deselectAll(measurment);
      measurment.setSelectedInteractive(true);
      return;
    }
    const ray = this.getRay(event);
    if (creator === undefined) {
      const creator = (this._creator = createCreator(this.measureType));
      if (creator === undefined) {
        await super.onClick(event);
        return;
      }
      if (creator.addPoint(ray, intersection)) {
        const { domainObject } = creator;
        initializeStyle(domainObject, this.rootDomainObject);
        this.deselectAll();
        rootDomainObject.addChildInteractive(domainObject);
        domainObject.setSelectedInteractive(true);
        domainObject.setVisibleInteractive(true, renderTarget);
      }
    } else {
      if (creator.addPoint(ray, intersection)) {
        if (creator.isFinished) {
          this.measureType = MeasureType.None;
          CommandsUpdater.update(renderTarget);
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
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override canBeSelected(domainObject: DomainObject): boolean {
    return domainObject instanceof MeasureDomainObject;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public handleEscape(): void {
    if (this._creator === undefined) {
      return;
    }
    if (this._creator.handleEscape()) {
      // Sucessfully created, set it back to none
      this.measureType = MeasureType.None;
      CommandsUpdater.update(this.renderTarget);
    }
    this._creator = undefined;
  }

  private setAllMeasurementsVisible(visible: boolean): void {
    for (const domainObject of this.rootDomainObject.getDescendantsByType(MeasureDomainObject)) {
      domainObject.setVisibleInteractive(visible, this.renderTarget);
    }
  }

  private getMeasurement(
    intersection: AnyIntersection | undefined
  ): MeasureDomainObject | undefined {
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    if (intersection.domainObject instanceof MeasureDomainObject) {
      return intersection.domainObject;
    } else {
      return undefined;
    }
  }

  private setCursor(
    boxDomainObject: MeasureBoxDomainObject,
    point: Vector3,
    pickInfo: BoxPickInfo
  ): void {
    if (pickInfo.focusType === FocusType.Body) {
      this.renderTarget.setMoveCursor();
    } else if (pickInfo.focusType === FocusType.Face) {
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
    } else if (pickInfo.focusType === FocusType.Corner) {
      const matrix = boxDomainObject.getMatrix();
      matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

      const faceCenter = pickInfo.face.getCenter();
      faceCenter.applyMatrix4(matrix);

      this.renderTarget.setResizeCursor(point, faceCenter);
    } else if (pickInfo.focusType === FocusType.Rotation) {
      this.renderTarget.setGrabCursor();
    } else {
      this.setDefaultCursor();
    }
  }

  protected defocusAll(except?: DomainObject | undefined): void {
    for (const domainObject of this.rootDomainObject.getDescendantsByType(MeasureDomainObject)) {
      if (except !== undefined && domainObject === except) {
        continue;
      }
      if (domainObject instanceof MeasureLineDomainObject) {
        domainObject.setFocusInteractive(FocusType.None);
      }
      if (domainObject instanceof MeasureBoxDomainObject) {
        domainObject.setFocusInteractive(FocusType.None);
      }
    }
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function initializeStyle(domainObject: DomainObject, rootDomainObject: RootDomainObject): void {
  // Just copy the style the depthTest field from any other MeasureDomainObject
  const otherDomainObject = rootDomainObject.getDescendantByType(MeasureDomainObject);
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

function createCreator(measureType: MeasureType): BaseCreator | undefined {
  switch (measureType) {
    case MeasureType.Line:
    case MeasureType.Polyline:
    case MeasureType.Polygon:
      return new MeasureLineCreator(measureType);

    case MeasureType.HorizontalArea:
    case MeasureType.VerticalArea:
    case MeasureType.Volume:
      return new MeasureBoxCreator(measureType);
    default:
      return undefined;
  }
}
