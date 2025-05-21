/*!
 * Copyright 2024 Cognite AS
 */

import { useRenderTarget } from '../components/RevealCanvas';
import { SetGhostModeCommand } from '../architecture/base/concreteCommands/cad/SetGhostModeCommand';
import { useProperty } from '../components/Architecture/useProperty';

export const useGhostMode = (): boolean => {
  // Hook to be used in Fusion only

  const renderTarget = useRenderTarget();
  const command = renderTarget.commandsController.getCommandByTypeRecursive(SetGhostModeCommand);
  const isChecked = useProperty(command, () => command !== undefined && command.isChecked);
  if (command === undefined) {
    return false;
  }
  return isChecked;
};
