import { type ReactElement } from 'react';
import { type BaseCommand } from '../../../architecture/base/commands/BaseCommand';
import { type PlacementType } from '../types';

export type IReactElementCreator = {
  create: (command: BaseCommand, placement: PlacementType) => ReactElement | undefined;
};
