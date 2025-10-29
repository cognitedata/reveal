import {
  type BaseCommand,
  GroupCommand,
  type TranslationInput
} from '../../../../src/architecture';

import { TestButtonCommand } from './TestButtonCommand';
import { TestSectionCommand } from './TestSectionCommand';

export class TestGroupCommand extends GroupCommand {
  constructor(title: TranslationInput, commands?: BaseCommand[]) {
    super({ title });

    const defaultCommands = commands ?? [
      new TestButtonCommand({}),
      new TestSectionCommand('Group section'),
      new TestButtonCommand({})
    ];

    defaultCommands.forEach((command) => this.add(command));
  }

  public override get tooltip(): TranslationInput {
    if (this.title === undefined || super.tooltip === undefined) {
      return { untranslated: 'Test group' };
    }
    return super.tooltip;
  }

  public override get isVisible(): boolean {
    return true;
  }
}
