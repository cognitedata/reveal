import { type ReactElement } from 'react';
import { Divider } from '@cognite/cogs.js';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { DividerCommand } from '../../architecture/base/commands/DividerCommand';
import { SectionCommand } from '../../architecture/base/commands/SectionCommand';
import { type PlacementType } from './types';
import { getDividerDirection } from './utilities';

export function createDivider(
  command: BaseCommand,
  placement: PlacementType
): ReactElement | undefined {
  if (command instanceof DividerCommand || command instanceof SectionCommand) {
    const direction = getDividerDirection(placement);
    return <Divider weight="2px" length="24px" direction={direction} key={command.uniqueId} />;
  }
  return undefined;
}
