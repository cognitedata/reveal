import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type BaseSliderCommand } from '../../architecture';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { useCommandProperty } from './useCommandProperty';

type CommonCommandProps = {
  icon: IconName;
  uniqueId: number;
  isVisible: boolean;
  isEnabled: boolean;
  isChecked: boolean;
};

export function useCommandProps(command: BaseCommand): CommonCommandProps {
  return {
    icon: useCommandIcon(command),
    uniqueId: useCommandUniqueId(command),
    isVisible: useCommandVisible(command),
    isEnabled: useCommandEnable(command),
    isChecked: useCommandChecked(command)
  };
}

export function useCommandIcon(command: BaseCommand): IconName {
  return useCommandProperty(command, () => command.icon);
}

export function useCommandUniqueId(command: BaseCommand): number {
  return useCommandProperty(command, () => command.uniqueId);
}

export function useCommandVisible(command: BaseCommand): boolean {
  return useCommandProperty(command, () => command.isVisible);
}

export function useCommandEnable(command: BaseCommand): boolean {
  return useCommandProperty(command, () => command.isEnabled);
}

export function useCommandChecked(command: BaseCommand): boolean {
  return useCommandProperty(command, () => command.isChecked);
}

export function useSliderCommandValue(command: BaseSliderCommand): number {
  return useCommandProperty(command, () => command.value);
}
