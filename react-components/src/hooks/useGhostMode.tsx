/*!
 * Copyright 2024 Cognite AS
 */

import { useRenderTarget } from '../components/RevealCanvas';
import { SetGhostModeCommand } from '../architecture/base/concreteCommands/cad/SetGhostModeCommand';
import { useCommandProps } from '../components/Architecture/useCommandProps';

export const useGhostMode = (): boolean => {
  // Hook to be used in Fusion only
  const renderTarget = useRenderTarget();
  const command = renderTarget.commandsController.getCommandByTypeRecursive(SetGhostModeCommand);
  if (command === undefined) {
    return false;
  }
  return useCommandProps(command).isChecked;
};
