import { type BaseCommand } from './BaseCommand';
import { type TranslationInput } from '../utilities/translation/TranslateInput';
import { RenderTargetCommand } from './RenderTargetCommand';
import { signal } from '@cognite/signals';

export type GroupCommandConfiguration = {
  title?: TranslationInput;
  isAccordion?: boolean;
};

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
  private readonly _commands: BaseCommand[] = [];
  public readonly isOpen = signal(true);

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor({ title, isAccordion = true }: GroupCommandConfiguration) {
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
    if (!(other instanceof GroupCommand)) {
      return false;
    }
    return this._title === other._title && this._isAccordion === other._isAccordion;
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
