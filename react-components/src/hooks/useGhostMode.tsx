/*!
 * Copyright 2024 Cognite AS
 */

import { useState } from 'react';
import { useRenderTarget } from '../components/RevealCanvas';
import { useOnUpdate } from '../components/Architecture/useOnUpdate';
import { SetGhostModeCommand } from '../architecture/base/concreteCommands/cad/SetGhostModeCommand';

export const useGhostMode = (): boolean => {
  // Hook to be used in Fusion only
  const [_isChecked, setChecked] = useState(false);

  const renderTarget = useRenderTarget();
  const command = renderTarget.commandsController.getCommandByTypeRecursive(SetGhostModeCommand);
  useOnUpdate(command, () => {
    if (command !== undefined) {
      setChecked(command.isChecked);
    }
  });
  if (command === undefined) {
    return false;
  }
  return command.isChecked;
};
