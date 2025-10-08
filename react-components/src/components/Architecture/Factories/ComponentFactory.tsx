import { type ReactElement } from 'react';
import { type BaseCommand } from '../../../architecture/base/commands/BaseCommand';
import { type PlacementType } from '../types';

export type CreateElementFunc = (
  command: BaseCommand,
  placement: PlacementType
) => ReactElement | undefined;

export class ComponentFactory {
  private readonly _items = new Array<{ createFunc: CreateElementFunc; order: number }>();

  public installElement(createFunc: CreateElementFunc, order: number = 0): void {
    this._items.push({ createFunc, order });
    this._items.sort((a, b) => a.order - b.order);
  }

  public createElement(command: BaseCommand, placement: PlacementType): ReactElement {
    if (this._items.length === 0) {
      throw new Error('No element creators installed. Please call installReactElement() first.');
    }
    for (const item of this._items) {
      const element = item.createFunc(command, placement);
      if (element !== undefined) {
        return element;
      }
    }
    throw new Error(`No element creator found for command: ${command.constructor.name}`);
  }
}
