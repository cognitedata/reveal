import { type AnyIntersection } from '@cognite/reveal';
import { type Vector2 } from 'three';
import { type Signal, signal } from '@cognite/signals';

export type ContextMenuData = {
  clickEvent: PointerEvent;
  position: Vector2;
  intersection: AnyIntersection | undefined;
};

export class ContextMenuController {
  private readonly _data = signal<ContextMenuData | undefined>(undefined);

  public get data(): Signal<ContextMenuData | undefined> {
    return this._data;
  }
}
