import { type ReactElement } from 'react';
import { Divider } from '@cognite/cogs.js';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { DividerCommand } from '../../architecture/base/commands/DividerCommand';
import { SectionCommand } from '../../architecture/base/commands/SectionCommand';
import { type PlacementType } from './types';
import { getDividerDirection } from './utilities';
import { type IReactElementCreator } from './Factories/IReactElementCreator';

export class DividerCreator implements IReactElementCreator {
  create(command: BaseCommand, placement: PlacementType): ReactElement | undefined {
    if (command instanceof DividerCommand || command instanceof SectionCommand) {
      return createDivider(command.uniqueId, placement);
    }
    return undefined;
  }
}

export function createDivider(key: string, placement: PlacementType): ReactElement {
  const direction = getDividerDirection(placement);
  return <Divider weight="2px" length="24px" direction={direction} key={key} />;
}
