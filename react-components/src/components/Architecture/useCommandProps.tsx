import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { BaseOptionCommand, TranslationInput, type BaseSliderCommand } from '../../architecture';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { useCommandProperty } from './useCommandProperty';
import { useMemo } from 'react';
import {
  BannerStatus,
  BaseBannerCommand
} from '../../architecture/base/commands/BaseBannerCommand';

/*
 * BaseCommand
 */

export type CommonCommandProps = {
  icon: IconName;
  uniqueId: number;
  isVisible: boolean;
  isEnabled: boolean;
  isChecked: boolean;
};

function getCommandProps(command: BaseCommand): CommonCommandProps {
  return {
    icon: command.icon,
    uniqueId: command.uniqueId,
    isVisible: command.isVisible,
    isEnabled: command.isEnabled,
    isChecked: command.isChecked
  };
}

export function useCommandProps(command: BaseCommand): CommonCommandProps {
  return useCommandProperty(command, () => getCommandProps(command));
}

/*
 * BaseOptionCommand
 */

export type OptionCommandProps = CommonCommandProps & {
  children: BaseCommand[] | undefined;
  hasChildren: boolean;
  selectedChild: BaseCommand | undefined;
};

function getOptionCommandProps(command: BaseOptionCommand): OptionCommandProps {
  return {
    ...getCommandProps(command),
    children: command.children,
    hasChildren: command.hasChildren,
    selectedChild: command.selectedChild
  };
}

export function useOptionCommandProps(command: BaseOptionCommand): OptionCommandProps {
  return useCommandProperty(command, () => getOptionCommandProps(command));
}

/*
 * BaseBannerCommand
 */

export type BannerCommandProps = CommonCommandProps & {
  content: TranslationInput;
  status: BannerStatus;
};

export function getBannerCommandProps(command: BaseBannerCommand): BannerCommandProps {
  return {
    ...getCommandProps(command),
    content: command.content,
    status: command.status
  };
}

export function useBannerCommandProps(command: BaseBannerCommand): BannerCommandProps {
  return useCommandProperty(command, () => getBannerCommandProps(command));
}

/* export function useCommandIcon(command: BaseCommand): IconName {
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
} */

export function useSliderCommandValue(command: BaseSliderCommand): number {
  return useCommandProperty(command, () => command.value);
}
