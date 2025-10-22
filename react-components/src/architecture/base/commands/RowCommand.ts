import type { BaseCommand } from './BaseCommand';
import { RenderTargetCommand } from './RenderTargetCommand';

export type RowCommandConfiguration = {
  commands: BaseCommand[];
};

/**
 * Represents a Row of commands in a row.
 */
export class RowCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _commands: BaseCommand[];

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor({ commands }: RowCommandConfiguration) {
    super();
    this._commands = commands;
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
