import { useRenderTarget } from '../components/RevealCanvas';
import { SetGhostModeCommand } from '../architecture/base/concreteCommands/cad/SetGhostModeCommand';
import { useNullableCommandProperty } from '../components/Architecture/hooks/useCommandProperty';

export const useGhostMode = (): boolean => {
  // Hook to be used in Fusion only
  const renderTarget = useRenderTarget();
  const command = renderTarget.commandsController.getCommandByTypeRecursive(SetGhostModeCommand);
  return useNullableCommandProperty(command, () => command?.isChecked) ?? false;
};
