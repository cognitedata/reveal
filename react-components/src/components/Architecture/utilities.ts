/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
import { RenderTargetCommand } from '../../architecture/base/commands/RenderTargetCommand';
import { type IconType } from '@cognite/cogs.js';
import { type PlacementType, type ButtonType, type FlexDirection } from './types';

export function getIcon(command: BaseCommand): IconType | undefined {
  if (command.icon === undefined) {
    return undefined;
  }
  return command.icon as IconType;
}

export function getFlexDirection(isHorizontal: boolean): FlexDirection {
  return isHorizontal ? 'row' : 'column';
}

export function getTooltipPlacement(isHorizontal: boolean): PlacementType {
  return isHorizontal ? 'top' : 'right';
}

export function getButtonType(command: BaseCommand): ButtonType {
  // This was the only way it went through compiler: (more button types will be added in the future)
  const type = command.buttonType;
  if (type === 'ghost' || type === 'ghost-destructive' || type === 'primary') {
    return type;
  }
  return 'ghost';
}

export function getDefaultCommand<T extends BaseCommand>(
  newCommand: T,
  renderTarget: RevealRenderTarget
): T {
  // If it exists from before, return the existing command
  // Otherwise, add the new command to the controller and attach the renderTarget.
  if (!newCommand.hasData) {
    const oldCommand = renderTarget.commandsController.getEqual(newCommand);
    if (oldCommand !== undefined) {
      return oldCommand as T;
    }
    renderTarget.commandsController.add(newCommand);
  }
  if (newCommand instanceof RenderTargetCommand) {
    newCommand.attach(renderTarget);
  }
  return newCommand;
}
