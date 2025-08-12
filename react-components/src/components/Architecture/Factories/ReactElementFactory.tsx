import { type ReactElement } from 'react';
import { type BaseCommand } from '../../../architecture/base/commands/BaseCommand';
import { type PlacementType } from '../types';
import { type IReactElementCreator } from './IReactElementCreator';

const _creators = new Array<IReactElementCreator>();
let _fallbackCreator: IReactElementCreator | undefined;

export function installReactElement(creator: IReactElementCreator): void {
  _creators.push(creator);
}

export function installFallbackReactElement(creator: IReactElementCreator): void {
  _fallbackCreator = creator;
}

export function createReactElement(command: BaseCommand, placement: PlacementType): ReactElement {
  for (const creator of _creators) {
    const element = creator.create(command, placement);
    if (element !== undefined) {
      return element;
    }
  }
  if (_fallbackCreator !== undefined) {
    const element = _fallbackCreator.create(command, placement);
    if (element !== undefined) {
      return element;
    }
  }
  throw new Error(`No element creator found for command: ${command.constructor.name}`);
}
