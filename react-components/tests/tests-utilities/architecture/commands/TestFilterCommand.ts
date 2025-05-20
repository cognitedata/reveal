import {
  BaseFilterCommand,
  BaseFilterItemCommand,
  type TranslationInput
} from '../../../../src/architecture';
import { type IconName } from '../../../../src/architecture/base/utilities/IconName';

export class TestFilterCommand extends BaseFilterCommand {
  public override get tooltip(): TranslationInput {
    return { untranslated: 'Test filter' };
  }

  protected override createChildren(): TestFilterItemCommand[] {
    return [
      new TestFilterItemCommand('Child filter option'),
      new TestFilterItemCommand('Child filter option 2')
    ];
  }

  public override get isVisible(): boolean {
    return true;
  }

  public override get icon(): IconName {
    return 'Cube';
  }

  public setChecked(checked: boolean): void {
    this.listChildren().forEach((child) => {
      child.setChecked(checked);
    });
  }

  public listChildren(): TestFilterItemCommand[] {
    return (this._children as TestFilterItemCommand[]) ?? [];
  }
}

export class TestFilterItemCommand extends BaseFilterItemCommand {
  private readonly _name: string;
  private _checked: boolean;

  public constructor(name: string) {
    super();
    this._name = name;
    this._checked = false;
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: this._name };
  }

  public override get isChecked(): boolean {
    return this._checked;
  }

  protected setCheckedCore(value: boolean): boolean {
    this._checked = value;
    return true;
  }
}
