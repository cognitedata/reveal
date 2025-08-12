import { type ReactElement } from 'react';
import { type BaseCommand } from '../../../architecture/base/commands/BaseCommand';
import { type PlacementType } from '../types';

const _items = new Array<{ creator: CreateReactElement; order: number }>();

export type CreateReactElement = (
  command: BaseCommand,
  placement: PlacementType
) => ReactElement | undefined;

export function installReactElement(creator: CreateReactElement, order: number = 0): void {
  _items.push({ creator, order });
  _items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function createReactElement(command: BaseCommand, placement: PlacementType): ReactElement {
  for (const item of _items) {
    const element = item.creator(command, placement);
    if (element !== undefined) {
      return element;
    }
  }
  if (_items.length === 0) {
    throw new Error('No element creators installed. Please call installReactElement() first.');
  }
  throw new Error(`No element creator found for command: ${command.constructor.name}`);
}
