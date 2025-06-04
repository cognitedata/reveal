import { FolderDomainObject } from '../../base/domainObjects/FolderDomainObject';
import { type TranslationInput } from '../../base/utilities/TranslateInput';

export class ClipFolder extends FolderDomainObject {
  public override get typeName(): TranslationInput {
    return { key: 'CROP_BOXES_AND_CLIPPING_PLANES' };
  }
}
