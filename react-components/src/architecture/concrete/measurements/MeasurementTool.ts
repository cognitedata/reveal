/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../base/commands/BaseCommand';
import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { ShowMeasurementsOnTopCommand } from './ShowMeasurementsOnTopCommand';
import { SetMeasurementTypeCommand } from './SetMeasurementTypeCommand';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { ToggleMetricUnitsCommand } from '../../base/concreteCommands/ToggleMetricUnitsCommand';
import { BoxOrLineEditTool } from '../box/BoxOrLineEditTool';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';
import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';
import { PrimitiveType } from '../box/PrimitiveType';
import { BoxCreator } from '../box/BoxCreator';
import { LineCreator } from '../box/LineCreator';

export class MeasurementTool extends BoxOrLineEditTool {
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

  protected override canBeSelected(domainObject: DomainObject): boolean {
    return (
      domainObject instanceof MeasureBoxDomainObject ||
      domainObject instanceof MeasureLineDomainObject
    );
  }

  // ==================================================
  // OVERRIDES of BoxOrLineEditTool
  // ==================================================

  protected override createCreator(primitiveType: PrimitiveType): BaseCreator | undefined {
    switch (primitiveType) {
      case PrimitiveType.Line:
      case PrimitiveType.Polyline:
      case PrimitiveType.Polygon:
        return new LineCreator(new MeasureLineDomainObject(primitiveType));

      case PrimitiveType.HorizontalArea:
      case PrimitiveType.VerticalArea:
      case PrimitiveType.Box:
        return new BoxCreator(new MeasureBoxDomainObject(primitiveType));
      default:
        return undefined;
    }
  }
}
