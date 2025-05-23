import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { useProperty } from './useProperty';

type CommonCommandProps = {
  icon: IconName;
  uniqueId: number;
  isVisible: boolean;
  isEnabled: boolean;
  isChecked: boolean;
};

export function useCommonCommandProps(command: BaseCommand): CommonCommandProps {
  return {
    icon: useProperty(command, () => command.icon),
    uniqueId: useProperty(command, () => command.uniqueId),
    isVisible: useProperty(command, () => command.isVisible),
    isEnabled: useProperty(command, () => command.isEnabled),
    isChecked: useProperty(command, () => command.isChecked)
  };
}
