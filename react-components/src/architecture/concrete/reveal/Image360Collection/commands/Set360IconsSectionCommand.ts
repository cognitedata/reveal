import { Image360CollectionDomainObject } from '../Image360CollectionDomainObject';
import { SectionCommand } from '../../../../base/commands/SectionCommand';
import { type TranslationInput } from '../../../../base/utilities/translation/TranslateInput';

export class Set360IconsSectionCommand extends SectionCommand {
  public override get isVisible(): boolean {
    return this.rootDomainObject.getDescendantByType(Image360CollectionDomainObject) !== undefined;
  }

  public override get tooltip(): TranslationInput {
    return { key: 'MARKERS_360' };
  }
}
