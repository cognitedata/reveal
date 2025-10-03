import { FolderDomainObject } from '../../../base/domainObjects/FolderDomainObject';
import { type TranslationInput } from '../../../base/utilities/translation/TranslateInput';

export class PointCloudFolder extends FolderDomainObject {
  public override get typeName(): TranslationInput {
    return { key: 'POINT_CLOUDS' };
  }
}
