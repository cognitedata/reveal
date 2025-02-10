/*!
 * Copyright 2025 Cognite AS
 */

import { FolderDomainObject } from '../../base/domainObjects/FolderDomainObject';
import { type TranslationInput } from '../../base/utilities/TranslateInput';

export class MeasurementFolder extends FolderDomainObject {
  public override get typeName(): TranslationInput {
    return { key: 'MEASUREMENTS' };
  }
}
