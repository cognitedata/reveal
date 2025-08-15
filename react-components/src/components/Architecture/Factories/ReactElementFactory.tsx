import { type ReactElement } from 'react';
import { type BaseCommand } from '../../../architecture/base/commands/BaseCommand';
import { type PlacementType } from '../types';
import { clear } from '../../../architecture/base/utilities/extensions/arrayUtils';

const _items = new Array<{ createFunc: CreateReactElementFunc; order: number }>();

export type CreateReactElementFunc = (
  command: BaseCommand,
  placement: PlacementType
) => ReactElement | undefined;

export function clearInstalledReactElements(): void {
  clear(_items);
}

export function installReactElement(createFunc: CreateReactElementFunc, order: number = 0): void {
  _items.push({ createFunc, order });
  _items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function createReactElement(command: BaseCommand, placement: PlacementType): ReactElement {
  if (_items.length === 0) {
    throw new Error('No element creators installed. Please call installReactElement() first.');
  }
  for (const item of _items) {
    const element = item.createFunc(command, placement);
    if (element !== undefined) {
      return element;
    }
  }
  throw new Error(`No element creator found for command: ${command.constructor.name}`);
}
