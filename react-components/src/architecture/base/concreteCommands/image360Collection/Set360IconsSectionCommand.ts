import { SectionCommand } from '../../commands/SectionCommand';
import { type TranslationInput } from '../../utilities/TranslateInput';

export class Set360IconsSectionCommand extends SectionCommand {
  public override get isVisible(): boolean {
    return this.renderTarget.get360ImageCollections().next().value !== undefined;
  }

  public override get tooltip(): TranslationInput {
    return { key: 'MARKERS_360' };
  }
}
