/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
import { RenderTargetCommand } from '../../architecture/base/commands/RenderTargetCommand';
import { type PlacementType, type ButtonType, type FlexDirection } from './types';

export function getFlexDirection(placement: PlacementType): FlexDirection {
  return placement === 'top' || placement === 'bottom' ? 'row' : 'column';
}

export function getDividerDirection(placement: PlacementType): string {
  return placement === 'top' || placement === 'bottom' ? 'vertical' : 'horizontal';
}

export function getTooltipPlacement(toolbarPlacement: PlacementType): PlacementType {
  // Try to keep the tooltip on the opposite side of the toolbar
  switch (toolbarPlacement) {
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    default:
      return 'top';
  }
}

export function getButtonType(command: BaseCommand): ButtonType {
  // This was the only way it went through compiler: (more button types will be added in the future)
  return command.buttonType as ButtonType;
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
