import { createContext } from 'react';
import { useModelsVisibilityState } from './hooks/useModelsVisibliityState';
import { useSyncExternalLayersState } from './hooks/useSyncExternalLayersState';
import { ModelLayerSelection } from './components/ModelLayerSelection';
import { useRenderTarget, useReveal } from '../../RevealCanvas';
import { use3dModels } from '../../../hooks/use3dModels';

export type LayersButtonDependencies = {
  useModelsVisibilityState: typeof useModelsVisibilityState;
  useSyncExternalLayersState: typeof useSyncExternalLayersState;
  ModelLayerSelection: typeof ModelLayerSelection;
  useReveal: typeof useReveal;
  use3dModels: typeof use3dModels;
  useRenderTarget: typeof useRenderTarget;
};

export const defaultLayersButtonDependencies: LayersButtonDependencies = {
  useModelsVisibilityState,
  useSyncExternalLayersState,
  ModelLayerSelection,
  useReveal,
  use3dModels,
  useRenderTarget
};

export const LayersButtonContext = createContext<LayersButtonDependencies>(
  defaultLayersButtonDependencies
);
