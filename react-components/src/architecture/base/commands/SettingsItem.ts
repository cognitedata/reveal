/*!
 * Copyright 2024 Cognite AS
 */
import { type BaseCommand } from './BaseCommand';

export type SettingsItem = {
  key: () => number;
};

export class CommandSettingsItem implements SettingsItem {
  constructor(public command: BaseCommand) {}

  key(): number {
    return this.command.uniqueId;
  }
}

export class DividerSettingsItem implements SettingsItem {
  constructor(private readonly _index: number) {}

  key(): number {
    return this._index;
  }
}
