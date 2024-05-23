/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseTool } from '../commands/BaseTool';

export type ActiveToolInfo = { activeTool: BaseTool };
export type SetActiveToolInfoDelegate = (activeToolInfo?: ActiveToolInfo) => void;

export class ExtraToolbarUpdater {
  // ==================================================
  // STATIC FIELDS
  // ==================================================

  private static _setActiveTool: SetActiveToolInfoDelegate | undefined = undefined;

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static isActive(): boolean {
    return this._setActiveTool !== undefined;
  }

  public static setActiveToolDelegate(value: SetActiveToolInfoDelegate | undefined): void {
    this._setActiveTool = value;
  }

  public static update(activeTool: BaseTool | undefined): void {
    if (this._setActiveTool === undefined) {
      return;
    }
    if (activeTool === undefined) {
      this._setActiveTool(undefined);
      return;
    }
    const info = { activeTool };
    this._setActiveTool(info);
  }
}
