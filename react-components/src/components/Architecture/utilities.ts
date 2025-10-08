import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
import { RenderTargetCommand } from '../../architecture/base/commands/RenderTargetCommand';
import { type PlacementType, type FlexDirection } from './types';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../constants';
import { type Placement } from '@floating-ui/dom';

export function getFlexDirection(placement: PlacementType): FlexDirection {
  return placement === 'top' || placement === 'bottom' ? 'row' : 'column';
}

export function getDividerDirection(placement: PlacementType): 'horizontal' | 'vertical' {
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

export const DROP_DOWN_OFFSET = { mainAxis: TOOLBAR_HORIZONTAL_PANEL_OFFSET, crossAxis: 0 };

// This ensures the rule for where the dropdown panel should open:
// Horizontal toolbar at top:    Below the button
// Horizontal toolbar at bottom: Above the button
// Vertical toolbar at left:     Right of the button
// Vertical toolbar at right:    Left of the button

export function getDropdownPlacement(placement: PlacementType): Placement {
  return placement === 'top' || placement === 'bottom' ? 'bottom-end' : 'right-start';
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
