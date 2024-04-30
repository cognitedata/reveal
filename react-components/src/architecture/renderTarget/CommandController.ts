/*!
 * Copyright 2024 Cognite AS
 * CommandsController: Holds the commands so they can be updated
 */

import { type BaseCommand } from '../commands/BaseCommand';

export class CommandController {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _commands = new Set<BaseCommand>();

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getEqual(command: BaseCommand): BaseCommand | undefined {
    // For some reason Set<> doesn't have find!
    for (const oldCommand of this._commands) {
      if (oldCommand.isEqual(command)) {
        return oldCommand;
      }
    }
    return undefined;
  }

  public add(command: BaseCommand): void {
    this._commands.add(command);
  }

  public update(): void {
    for (const command of this._commands) {
      command.update();
    }
  }

  public dispose(): void {
    for (const tool of this._commands) {
      tool.dispose();
    }
  }
}
