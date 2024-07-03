/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../../../../components/Architecture/getIconComponent';
import { ShowDomainObjectsOnTopCommand } from '../../../base/commands/ShowDomainObjectsOnTopCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { MeasureBoxDomainObject } from '../MeasureBoxDomainObject';
import { MeasureLineDomainObject } from '../MeasureLineDomainObject';

export class ShowMeasurementsOnTopCommand extends ShowDomainObjectsOnTopCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): IconName {
    return 'EyeShow';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'MEASUREMENTS_SHOW_ON_TOP', fallback: 'Show all measurements on top' };
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return (
      domainObject instanceof MeasureBoxDomainObject ||
      domainObject instanceof MeasureLineDomainObject
    );
  }
}
