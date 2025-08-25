import { type IconName } from '../../../base/utilities/types';
import { ShowDomainObjectsOnTopCommand } from '../../../base/commands/ShowDomainObjectsOnTopCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslationInput } from '../../../base/utilities/translation/TranslateInput';
import { MeasureBoxDomainObject } from '../MeasureBoxDomainObject';
import { MeasureLineDomainObject } from '../MeasureLineDomainObject';
import { MeasureCylinderDomainObject } from '../MeasureCylinderDomainObject';
import { MeasurePointDomainObject } from '../point/MeasurePointDomainObject';

export class ShowMeasurementsOnTopCommand extends ShowDomainObjectsOnTopCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): IconName {
    return 'EyeShow';
  }

  public override get tooltip(): TranslationInput {
    return { key: 'MEASUREMENTS_SHOW_ON_TOP' };
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return (
      domainObject instanceof MeasureBoxDomainObject ||
      domainObject instanceof MeasureLineDomainObject ||
      domainObject instanceof MeasureCylinderDomainObject ||
      domainObject instanceof MeasurePointDomainObject
    );
  }
}
