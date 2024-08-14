/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../utilities/TranslateKey';
import { type BaseCommand } from './BaseCommand';
import { RenderTargetCommand } from './RenderTargetCommand';

export class SettingsCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS/PROPERTIES
  // ==================================================

  private readonly _children: BaseCommand[] = [];

  public get children(): BaseCommand[] {
    return this._children;
  }

  public get hasChildren(): boolean {
    return this._children.length > 0;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'SETTINGS_TOOLTIP', fallback: 'Settings' };
  }

  public override get icon(): string | undefined {
    return 'Settings';
  }

  protected override *getChildren(): Generator<BaseCommand> {
    if (this._children === undefined) {
      return;
    }
    for (const child of this._children) {
      yield child;
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public add(command: BaseCommand): void {
    if (this._children.find((c) => c.equals(command)) !== undefined) {
      console.error('Duplicated command given: ' + command.name);
      return;
    }
    this._children.push(command);
  }
}
