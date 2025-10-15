import { createContext } from 'react';
import { useModelsVisibilityState } from './hooks/useModelsVisibilityState';
import { useSyncExternalLayersState } from './hooks/useSyncExternalLayersState2';
import { ModelLayerSelection } from './components/ModelLayerSelection2';
import { useRenderTarget } from '../../RevealCanvas';

export type LayersButtonDependencies = {
  useModelsVisibilityState: typeof useModelsVisibilityState;
  useSyncExternalLayersState: typeof useSyncExternalLayersState;
  ModelLayerSelection: typeof ModelLayerSelection;
  useRenderTarget: typeof useRenderTarget;
};

export const defaultLayersButtonDependencies: LayersButtonDependencies = {
  useModelsVisibilityState,
  useSyncExternalLayersState,
  ModelLayerSelection,
  useRenderTarget
};

export const LayersButtonContext = createContext<LayersButtonDependencies>(
  defaultLayersButtonDependencies
);
