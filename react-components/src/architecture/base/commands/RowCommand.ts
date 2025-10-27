import { BaseCommand } from './BaseCommand';

/**
 * Represents a Row of commands in a row.
 */
export class RowCommand extends BaseCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _commands: BaseCommand[] = [];

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
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
    return this._commands.some(({ isVisible }) => !!isVisible);
  }

  public override equals(other: BaseCommand): boolean {
    return this === other;
  }

  protected override invokeCore(): boolean {
    throw Error('invoke should never be called on a Row.');
  }

  protected override *getChildren(): Generator<BaseCommand> {
    for (const child of this._commands) {
      yield child;
    }
  }

  // ==================================================
  // GETTERS
  // ==================================================

  public get commands(): BaseCommand[] {
    return this._commands;
  }

  public get hasCommands(): boolean {
    return this._commands.length > 0;
  }
}
