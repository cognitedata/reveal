/*!
 * Copyright 2023 Cognite AS
 */

import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
import { RenderTargetCommand } from '../../architecture/base/commands/RenderTargetCommand';
import { type IconType } from '@cognite/cogs.js';

export function getIcon(command: BaseCommand): IconType | undefined {
  if (command.icon === undefined) {
    return undefined;
  }
  return command.icon as IconType;
}

export function getTooltipPlacement(isHorizontal: boolean): 'top' | 'right' {
  return isHorizontal ? 'top' : 'right';
}

export function getButtonType(command: BaseCommand): 'ghost' | 'ghost-destructive' | 'primary' {
  // This was the only way it went through compiler: (more button types will be added in the future)
  const type = command.buttonType;
  if (type === 'ghost' || type === 'ghost-destructive' || type === 'primary') {
    return type;
  }
  return 'ghost';
}

export function getDefaultCommand(
  newCommand: BaseCommand,
  renderTarget: RevealRenderTarget
): BaseCommand {
  // If it exists from before, return the existing command
  // Otherwise, add the new command to the controller and attach the renderTarget.
  if (!newCommand.hasData) {
    const oldCommand = renderTarget.commandsController.getEqual(newCommand);
    if (oldCommand !== undefined) {
      return oldCommand;
    }
    renderTarget.commandsController.add(newCommand);
  }
  if (newCommand instanceof RenderTargetCommand) {
    newCommand.attach(renderTarget);
  }
  return newCommand;
}
