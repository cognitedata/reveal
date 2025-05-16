import { type TranslationInput } from '../../../../src/architecture';
import { SectionCommand } from '../../../../src/architecture/base/commands/SectionCommand';

export class TestSectionCommand extends SectionCommand {
  private readonly _content: string | undefined;

  constructor(content?: string) {
    super();
    this._content = content;
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: this._content ?? 'Test section command' };
  }
}
