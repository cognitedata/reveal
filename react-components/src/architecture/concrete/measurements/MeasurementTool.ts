/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../base/commands/BaseCommand';
import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { ShowMeasurementsOnTopCommand } from './commands/ShowMeasurementsOnTopCommand';
import { SetMeasurementTypeCommand } from './commands/SetMeasurementTypeCommand';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PrimitiveEditTool } from '../primitives/PrimitiveEditTool';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';
import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';
import { PrimitiveType } from '../primitives/PrimitiveType';
import { BoxCreator } from '../primitives/box/BoxCreator';
import { LineCreator } from '../primitives/line/LineCreator';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { UndoCommand } from '../../base/concreteCommands/UndoCommand';
import { type IconName } from '../../base/utilities/IconName';

export class MeasurementTool extends PrimitiveEditTool {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(PrimitiveType.None);
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): IconName {
    return 'Ruler';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'MEASUREMENTS', fallback: 'Measurements' };
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new SetMeasurementTypeCommand(PrimitiveType.Line),
      new SetMeasurementTypeCommand(PrimitiveType.Polyline),
      new SetMeasurementTypeCommand(PrimitiveType.Polygon),
      new SetMeasurementTypeCommand(PrimitiveType.HorizontalArea),
      new SetMeasurementTypeCommand(PrimitiveType.VerticalArea),
      new SetMeasurementTypeCommand(PrimitiveType.Box),
      undefined, // Separator
      new UndoCommand(),
      new ShowMeasurementsOnTopCommand()
    ];
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
    for (const domainObject of this.getSelectable()) {
      if (domainObject instanceof MeasureBoxDomainObject) {
        const boundingBox = domainObject.getBoundingBox();
        boundingBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
        if (!sceneBoundingBox.intersectsBox(boundingBox)) {
          continue;
        }
      } else if (domainObject instanceof MeasureLineDomainObject) {
        const boundingBox = domainObject.getBoundingBox();
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
      domainObject instanceof MeasureLineDomainObject
    );
  }

  // ==================================================
  // OVERRIDES of BoxOrLineEditTool
  // ==================================================

  protected override createCreator(): BaseCreator | undefined {
    switch (this.primitiveType) {
      case PrimitiveType.Line:
      case PrimitiveType.Polyline:
      case PrimitiveType.Polygon:
        return new LineCreator(this, new MeasureLineDomainObject(this.primitiveType));

      case PrimitiveType.HorizontalArea:
      case PrimitiveType.VerticalArea:
      case PrimitiveType.Box:
        return new BoxCreator(this, new MeasureBoxDomainObject(this.primitiveType));
      default:
        return undefined;
    }
  }
}
