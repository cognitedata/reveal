import { FolderDomainObject } from '../../../base/domainObjects/FolderDomainObject';
import { type TranslationInput } from '../../../base/utilities/translation/TranslateInput';

export class Image360CollectionFolder extends FolderDomainObject {
  public override get typeName(): TranslationInput {
    return { key: 'IMAGES_360' };
  }
}
