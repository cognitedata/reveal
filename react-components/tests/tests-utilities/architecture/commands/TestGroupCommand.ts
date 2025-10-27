import {
  type BaseCommand,
  GroupCommand,
  type TranslationInput
} from '../../../../src/architecture';
import { type UntranslatedString } from '../../../../src/architecture/base/utilities/translation/TranslateInput';

import { TestButtonCommand } from './TestButtonCommand';
import { TestSectionCommand } from './TestSectionCommand';

export class TestGroupCommand extends GroupCommand {
  constructor(title: TranslationInput, commands?: BaseCommand[]) {
    const defaultCommands = commands ?? [
      new TestButtonCommand({
        onClick: () => {}
      }),
      new TestSectionCommand('Group section'),
      new TestButtonCommand({
        onClick: () => {}
      })
    ];

    super({ title, commands: defaultCommands });
  }

  public override get tooltip(): TranslationInput {
    return {
      untranslated: `Test group: ${(this.title as UntranslatedString).untranslated}`
    };
  }

  public override get isVisible(): boolean {
    return true;
  }
}
