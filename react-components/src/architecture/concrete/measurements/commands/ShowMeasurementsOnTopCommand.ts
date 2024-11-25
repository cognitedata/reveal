/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../../../base/utilities/IconName';
import { ShowDomainObjectsOnTopCommand } from '../../../base/commands/ShowDomainObjectsOnTopCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { MeasureBoxDomainObject } from '../MeasureBoxDomainObject';
import { MeasureLineDomainObject } from '../MeasureLineDomainObject';

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
      domainObject instanceof MeasureLineDomainObject
    );
  }
}
