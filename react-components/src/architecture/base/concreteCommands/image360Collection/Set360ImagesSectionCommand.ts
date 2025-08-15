import { Image360CollectionDomainObject } from '../../../concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { SectionCommand } from '../../commands/SectionCommand';
import { type TranslationInput } from '../../utilities/TranslateInput';

export class Set360ImagesSectionCommand extends SectionCommand {
  public override get isVisible(): boolean {
    return this.rootDomainObject.getDescendantByType(Image360CollectionDomainObject) !== undefined;
  }

  public override get tooltip(): TranslationInput {
    return { key: 'IMAGES_360' };
  }
}
