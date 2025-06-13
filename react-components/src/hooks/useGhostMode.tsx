import { useRenderTarget } from '../components/RevealCanvas';
import { SetGhostModeCommand } from '../architecture/base/concreteCommands/cad/SetGhostModeCommand';
import { useCommandChecked } from '../components/Architecture/hooks/useCommandProps';

export const useGhostMode = (): boolean => {
  // Hook to be used in Fusion only
  const renderTarget = useRenderTarget();
  const command = renderTarget.commandsController.getCommandByTypeRecursive(SetGhostModeCommand);
  if (command === undefined) {
    return false;
  }
  return useCommandChecked(command);
};
