/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../base/commands/BaseCommand';
import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { ShowMeasurementsOnTopCommand } from './commands/ShowMeasurementsOnTopCommand';
import { SetMeasurementTypeCommand } from './commands/SetMeasurementTypeCommand';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { ToggleMetricUnitsCommand } from '../../base/concreteCommands/ToggleMetricUnitsCommand';
import { PrimitiveEditTool } from '../primitives/PrimitiveEditTool';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';
import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';
import { PrimitiveType } from '../primitives/PrimitiveType';
import { BoxCreator } from '../primitives/box/BoxCreator';
import { LineCreator } from '../primitives/line/LineCreator';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';

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

  public override get icon(): string {
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
      new ToggleMetricUnitsCommand(),
      new ShowMeasurementsOnTopCommand()
    ];
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onActivate(): void {
    super.onActivate();
    this.setAllVisible(true);
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
        return new LineCreator(new MeasureLineDomainObject(this.primitiveType));

      case PrimitiveType.HorizontalArea:
      case PrimitiveType.VerticalArea:
      case PrimitiveType.Box:
        return new BoxCreator(new MeasureBoxDomainObject(this.primitiveType));
      default:
        return undefined;
    }
  }
}
