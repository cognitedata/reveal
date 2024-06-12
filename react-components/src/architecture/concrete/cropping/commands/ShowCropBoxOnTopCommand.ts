/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { ShowOnTopCommand } from '../../boxAndLines/ShowOnTopCommand';
import { CropBoxDomainObject } from '../CropBoxDomainObject';

export class ShowCropBoxOnTopCommand extends ShowOnTopCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get icon(): string {
    return 'Flag';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'MEASUREMENTS_SHOW_ON_TOP', fallback: 'Show all measurements on top' };
  }

  protected override canBeSelected(domainObject: DomainObject): boolean {
    return domainObject instanceof CropBoxDomainObject;
  }
}
