import { createContext } from 'react';
import { useModelHandlers } from './hooks/useModelHandlers';
import { useSyncExternalLayersState } from './hooks/useSyncExternalLayersState';
import { ModelLayerSelection } from './components/ModelLayerSelection';
import { useReveal } from '../../RevealCanvas';
import { use3dModels } from '../../../hooks/use3dModels';

export type LayersButtonDependencies = {
  useModelHandlers: typeof useModelHandlers;
  useSyncExternalLayersState: typeof useSyncExternalLayersState;
  ModelLayerSelection: typeof ModelLayerSelection;
  useReveal: typeof useReveal;
  use3dModels: typeof use3dModels;
};

export const LayersButtonContext = createContext<LayersButtonDependencies>({
  useModelHandlers,
  useSyncExternalLayersState,
  ModelLayerSelection,
  useReveal,
  use3dModels
});
