import {
  type BaseCommand,
  GroupCommand,
  type TranslationInput
} from '../../../../src/architecture';
import { TestButtonCommand } from './TestButtonCommand';
import { TestSectionCommand } from './TestSectionCommand';

export class TestGroupCommand extends GroupCommand {
  constructor(title: string, commands?: BaseCommand[]) {
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
    return { untranslated: `Test group: ${this.title}` };
  }

  public override get isVisible(): boolean {
    return true;
  }
}
