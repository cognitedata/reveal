import { type TranslationInput } from '../../../../src/architecture/base/utilities/translation/TranslateInput';
import { SectionCommand } from '../../../../src/architecture/base/commands/SectionCommand';

export class MockSectionCommand extends SectionCommand {
  public override get tooltip(): TranslationInput {
    return { untranslated: 'Slider section' };
  }
}
