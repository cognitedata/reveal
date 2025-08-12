import { type ReactElement } from 'react';
import { type BaseCommand } from '../../../architecture/base/commands/BaseCommand';
import { type PlacementType } from '../types';
import { type IReactElementCreator } from './IReactElementCreator';

const _items = new Array<{ creator: IReactElementCreator; order: number }>();

export function installReactElement(creator: IReactElementCreator, order: number = 0): void {
  _items.push({ creator, order });
  _items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function createReactElement(command: BaseCommand, placement: PlacementType): ReactElement {
  for (const item of _items) {
    const element = item.creator.create(command, placement);
    if (element !== undefined) {
      return element;
    }
  }
  if (_items.length === 0) {
    throw new Error('No element creators installed. Please call installReactElement() first.');
  }
  throw new Error(`No element creator found for command: ${command.constructor.name}`);
}
