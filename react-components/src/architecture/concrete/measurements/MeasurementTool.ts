import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { type TranslationInput } from '../../base/utilities/translation/TranslateInput';
import { PrimitiveEditTool } from '../primitives/tools/PrimitiveEditTool';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';
import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { BoxCreator } from '../primitives/box/BoxCreator';
import { LineCreator } from '../primitives/line/LineCreator';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type IconName } from '../../base/utilities/types';
import { Box3 } from 'three';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { MeasurementFolder } from './MeasurementFolder';
import { getMeasureDiameter, MeasureCylinderDomainObject } from './MeasureCylinderDomainObject';
import { CylinderCreator } from '../primitives/cylinder/CylinderCreator';
import { MeasurePointDomainObject } from './point/MeasurePointDomainObject';
import { MeasurePointCreator } from './point/MeasurePointCreator';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { updateMarker, updateMeasureDiameter } from './diameter/measureDiameterToolUtils';
import { getCircleMarker } from '../circleMarker/CircleMarkerDomainObject';

const POINT_SIZE_CHANGE_FACTOR = 0.1;

export class MeasurementTool extends PrimitiveEditTool {
  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): IconName {
    return 'Ruler';
  }

  public override get tooltip(): TranslationInput {
    return { key: 'MEASUREMENTS' };
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override async onHoverByDebounce(event: PointerEvent): Promise<void> {
    if (this.primitiveType === PrimitiveType.Diameter) {
      if (await updateMarker(this, event)) {
        return;
      }
    }
    await super.onHoverByDebounce(event);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    if (this.primitiveType === PrimitiveType.Diameter) {
      if (await updateMeasureDiameter(this, this.renderTarget.camera.position, event)) {
        return;
      }
    }
    await super.onClick(event);
  }

  public override onActivate(): void {
    super.onActivate();

    if (!this.renderTarget.isGlobalClippingActive) {
      this.setAllVisible(true);
      return;
    }
    const sceneBoundingBox = this.renderTarget.clippedVisualSceneBoundingBox;
    const boundingBox = new Box3();
    for (const domainObject of this.getSelectable()) {
      if (
        domainObject instanceof MeasurePointDomainObject ||
        domainObject instanceof MeasureBoxDomainObject ||
        domainObject instanceof MeasureLineDomainObject ||
        domainObject instanceof MeasureCylinderDomainObject
      ) {
        boundingBox.makeEmpty();
        domainObject.expandBoundingBox(boundingBox);
        boundingBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
        if (!sceneBoundingBox.intersectsBox(boundingBox)) {
          continue;
        }
      }
      domainObject.setVisibleInteractive(true, this.renderTarget);
    }
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    this.setAllVisible(false);
  }

  public override async onWheel(event: WheelEvent, delta: number): Promise<void> {
    if (this.primitiveType === PrimitiveType.Diameter) {
      const circleMarker = getCircleMarker(this.rootDomainObject);
      if (circleMarker !== undefined && circleMarker.isVisible()) {
        circleMarker.onWheel(delta);
        return;
      }
    }
    const intersection = await this.getIntersection(event);
    const domainObject = this.getIntersectedSelectableDomainObject(intersection);
    if (!(domainObject instanceof MeasurePointDomainObject)) {
      await super.onWheel(event, delta);
      return;
    }
    if (domainObject.focusType === FocusType.None) {
      await super.onWheel(event, delta);
      return;
    }
    // Change size
    this.addTransaction(domainObject.createTransaction(Changes.geometry));
    const factor = 1 - Math.sign(delta) * POINT_SIZE_CHANGE_FACTOR;
    domainObject.size *= factor;
    domainObject.notify(Changes.geometry);
  }

  public override clearDragging(): void {
    const circleMarker = getCircleMarker(this.rootDomainObject);
    circleMarker?.setVisibleInteractive(false);
    super.clearDragging();
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return (
      domainObject instanceof MeasurePointDomainObject ||
      domainObject instanceof MeasureBoxDomainObject ||
      domainObject instanceof MeasureLineDomainObject ||
      domainObject instanceof MeasureCylinderDomainObject
    );
  }

  // ==================================================
  // OVERRIDES of PrimitiveEditTool
  // ==================================================

  protected override getOrCreateParent(): DomainObject {
    const parent = this.rootDomainObject.getDescendantByType(MeasurementFolder);
    if (parent !== undefined) {
      return parent;
    }
    const newParent = new MeasurementFolder();
    newParent.isExpanded = true;
    this.renderTarget.rootDomainObject.addChildInteractive(newParent);
    return newParent;
  }

  protected override createCreator(): BaseCreator | undefined {
    switch (this.primitiveType) {
      case PrimitiveType.Point:
        return new MeasurePointCreator(new MeasurePointDomainObject());

      case PrimitiveType.Line:
      case PrimitiveType.Polyline:
      case PrimitiveType.Polygon:
        return new LineCreator(new MeasureLineDomainObject(this.primitiveType), this.undoManager);

      case PrimitiveType.HorizontalArea:
      case PrimitiveType.VerticalArea:
      case PrimitiveType.Box:
        return new BoxCreator(new MeasureBoxDomainObject(this.primitiveType));

      case PrimitiveType.VerticalCylinder:
      case PrimitiveType.HorizontalCylinder:
      case PrimitiveType.HorizontalCircle:
        return new CylinderCreator(new MeasureCylinderDomainObject(this.primitiveType));

      default:
        return undefined;
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getOrCreateMeasureDiameter(): MeasureCylinderDomainObject {
    const existing = getMeasureDiameter(this.rootDomainObject);
    if (existing !== undefined) {
      return existing;
    }
    const parent = this.getOrCreateParent();
    const domainObject = new MeasureCylinderDomainObject(PrimitiveType.Diameter);
    parent.addChildInteractive(domainObject);
    return domainObject;
  }
}
