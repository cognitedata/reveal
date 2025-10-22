import { GroupCommand, type TranslationInput } from '../../../../src/architecture';
import { TestButtonCommand } from './TestButtonCommand';
import { TestSectionCommand } from './TestSectionCommand';

export class TestGroupCommand extends GroupCommand {
  constructor(title: string, commands?: any[]) {
    const defaultCommands = commands || [
      new TestButtonCommand({ onClick: () => console.log('Group button 1 clicked') }),
      new TestSectionCommand('Group section'),
      new TestButtonCommand({ onClick: () => console.log('Group button 2 clicked') })
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
