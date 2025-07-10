import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { PrimitiveEditTool } from '../primitives/tools/PrimitiveEditTool';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';
import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { BoxCreator } from '../primitives/box/BoxCreator';
import { LineCreator } from '../primitives/line/LineCreator';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type IconName } from '../../base/utilities/IconName';
import { Box3 } from 'three';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { MeasurementFolder } from './MeasurementFolder';
import { MeasureCylinderDomainObject } from './MeasureCylinderDomainObject';
import { CylinderCreator } from '../primitives/cylinder/CylinderCreator';

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

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return (
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
}
