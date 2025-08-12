import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { BaseSettingsCommand } from '../../architecture/base/commands/BaseSettingsCommand';
import { type PlacementType } from './types';
import { type ReactElement } from 'react';
import { type IReactElementCreator } from './Factories/IReactElementCreator';
import { SettingsButton } from './SettingsButton';

export class SettingsButtonCreator implements IReactElementCreator {
  create(command: BaseCommand, placement: PlacementType): ReactElement | undefined {
    if (command instanceof BaseSettingsCommand) {
      return <SettingsButton key={command.uniqueId} inputCommand={command} placement={placement} />;
    }
    return undefined;
  }
}
