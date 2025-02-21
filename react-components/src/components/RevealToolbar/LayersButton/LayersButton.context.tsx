/*!
 * Copyright 2025 Cognite AS
 */
import { createContext } from 'react';
import { useModelHandlers } from './hooks/useModelHandlers';
import { useSyncExternalLayersState } from './hooks/useSyncExternalLayersState';
import { ModelLayerSelection } from './ModelLayerSelection';

export type LayersButtonDependencies = {
  useModelHandlers: typeof useModelHandlers;
  useSyncExternalLayersState: typeof useSyncExternalLayersState;
  ModelLayerSelection: typeof ModelLayerSelection;
};

export const LayersButtonContext = createContext<LayersButtonDependencies>({
  useModelHandlers,
  useSyncExternalLayersState,
  ModelLayerSelection
});
