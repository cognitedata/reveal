/*!
 * Copyright 2024 Cognite AS
 */
import { type AnyIntersection } from '@cognite/reveal';
import { ContextMenuUpdater } from '../reactUpdaters/ContextMenuUpdater';
import { type Vector2 } from 'three';

export type ContextMenuData = {
  position: Vector2;
  intersection: AnyIntersection | undefined;
};

export class ContextMenuController {
  private _contextMenuPosition: ContextMenuData | undefined = undefined;

  public get contextMenuPositionData(): ContextMenuData | undefined {
    return this._contextMenuPosition;
  }

  public set contextMenuPositionData(data: ContextMenuData | undefined) {
    this._contextMenuPosition = data;
    ContextMenuUpdater.update();
  }
}
