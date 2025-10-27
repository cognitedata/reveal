import { BaseCommand } from './BaseCommand';
import { type TranslationInput } from '../utilities/translation/TranslateInput';
import { RenderTargetCommand } from './RenderTargetCommand';

/**
 * Represents a group of commands.
 * This is used to group commands together and display them as a single unit.
 * Can be used as either a collapsible accordion (with title) or a simple row (without title).
 */
export class GroupCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _title?: TranslationInput;
  private readonly _isAccordion: boolean;
  private _commands: BaseCommand[] = [];

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(title?: TranslationInput, isAccordion: boolean = true) {
    super();
    this._title = title;
    this._isAccordion = isAccordion;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public add<T extends BaseCommand>(command: T): T {
    if (this._commands.find((c) => c.equals(command)) !== undefined) {
      console.error('Duplicated command given: ' + command.name);
    } else {
      this._commands.push(command);
    }
    return command;
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

  public get title(): TranslationInput | undefined {
    return this._title;
  }

  public get isAccordion(): boolean {
    return this._isAccordion;
  }

  public override get tooltip(): TranslationInput | undefined {
    return this._title;
  }

  public get commands(): BaseCommand[] {
    return this._commands;
  }

  public get hasCommands(): boolean {
    return this._commands.length > 0;
  }
}
