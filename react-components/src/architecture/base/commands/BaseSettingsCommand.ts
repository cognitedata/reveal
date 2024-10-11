/*!
 * Copyright 2024 Cognite AS
 */

import { clear } from '../utilities/extensions/arrayExtensions';
import { type BaseCommand } from './BaseCommand';
import { RenderTargetCommand } from './RenderTargetCommand';
import { CommandSettingsItem, DividerSettingsItem, type SettingsItem } from './SettingsItem';

export abstract class BaseSettingsCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS/PROPERTIES
  // ==================================================

  private readonly _children: SettingsItem[] = [];

  public get children(): SettingsItem[] {
    return this._children;
  }

  public get hasChildren(): boolean {
    return this._children.length > 0;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  protected override *getChildren(): Generator<BaseCommand> {
    if (this._children === undefined) {
      return;
    }
    for (const child of this._children) {
      if (child instanceof CommandSettingsItem) {
        yield child.command;
      }
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getSettingsItems(): SettingsItem[] {
    return this._children;
  }

  public addCommand(command: BaseCommand): void {
    if (
      this._children.find((c) => c instanceof CommandSettingsItem && c.command.equals(command)) !==
      undefined
    ) {
      console.error('Duplicated command given: ' + command.name);
      return;
    }
    this._children.push(new CommandSettingsItem(command));
  }

  public addDivider(): void {
    this._children.push(new DividerSettingsItem(this._children.length));
  }

  public clear(): void {
    clear(this._children);
  }
}
