import { type TranslateDelegate } from '../../../../src/architecture';
import { SectionCommand } from '../../../../src/architecture/base/commands/SectionCommand';

export class TestSectionCommand extends SectionCommand {
  private readonly _content: string | undefined;

  constructor(content?: string) {
    super();
    this._content = content;
  }

  public override getLabel(t: TranslateDelegate): string {
    return t({ untranslated: this._content ?? 'Test section command' });
  }
}
