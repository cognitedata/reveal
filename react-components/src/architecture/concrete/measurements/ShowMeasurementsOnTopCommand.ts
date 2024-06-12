/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { ShowOnTopCommand } from '../box/ShowOnTopCommand';
import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';

export class ShowMeasurementsOnTopCommand extends ShowOnTopCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'MEASUREMENTS_SHOW_ON_TOP', fallback: 'Show all measurements on top' };
  }

  protected override canBeSelected(domainObject: DomainObject): boolean {
    return (
      domainObject instanceof MeasureBoxDomainObject ||
      domainObject instanceof MeasureLineDomainObject
    );
  }
}
