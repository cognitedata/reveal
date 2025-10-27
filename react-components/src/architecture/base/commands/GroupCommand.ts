import type { BaseCommand } from './BaseCommand';
import { RenderTargetCommand } from './RenderTargetCommand';
import { type TranslationInput } from '../utilities/translation/TranslateInput';

export type GroupCommandConfiguration = {
  title: TranslationInput;
  commands: BaseCommand[];
};

/**
 * Represents a group of commands.
 * This is used to group commands together and display them as a single unit.
 */
export class GroupCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _title: TranslationInput;
  private readonly _commands: BaseCommand[];

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor({ title, commands }: GroupCommandConfiguration) {
    super();
    this._title = title;
    this._commands = commands;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get isVisible(): boolean {
    return this._commands.some(({ isVisible }) => isVisible);
  }

  public override equals(other: BaseCommand): boolean {
    return this === other;
  }

  protected override invokeCore(): boolean {
    throw Error('invoke should never be called on a group.');
  }

  protected override *getChildren(): Generator<BaseCommand> {
    for (const child of this._commands) {
      yield child;
    }
  }

  // ==================================================
  // GETTERS
  // ==================================================

  public get title(): TranslationInput {
    return this._title;
  }

  public override get tooltip(): TranslationInput {
    return this._title;
  }

  public get commands(): BaseCommand[] {
    return this._commands;
  }

  public get hasCommands(): boolean {
    return this._commands.length > 0;
  }
}
