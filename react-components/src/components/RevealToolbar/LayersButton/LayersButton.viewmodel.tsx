/*!
 * Copyright 2025 Cognite AS
 */
import { type ReactElement, useContext, type Dispatch, type SetStateAction } from 'react';
import { LayersButtonContext } from './LayersButton.context';
import {
  type ModelLayerHandlers,
  type DefaultLayersConfiguration,
  type LayersUrlStateParam
} from './types';
import { type Signal } from '@cognite/signals';
import { type ModelHandler } from './ModelHandler';

export function useLayersButtonViewModel(
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  defaultLayerConfiguration: DefaultLayersConfiguration | undefined,
  externalLayersState: LayersUrlStateParam | undefined
): {
  modelLayerHandlers: Signal<ModelLayerHandlers>;
  updateCallback: Signal<() => void>;
  ModelLayerSelection: ({
    label,
    modelLayerHandlers,
    update
  }: {
    label: string;
    modelLayerHandlers: ModelHandler[];
    update: () => void;
  }) => ReactElement;
} {
  const { useModelHandlers, useSyncExternalLayersState, ModelLayerSelection } =
    useContext(LayersButtonContext);

  const [modelLayerHandlers, update] = useModelHandlers(
    setExternalLayersState,
    defaultLayerConfiguration
  );

  useSyncExternalLayersState(
    modelLayerHandlers(),
    externalLayersState,
    setExternalLayersState,
    update()
  );

  return {
    modelLayerHandlers,
    updateCallback: update,
    ModelLayerSelection
  };
}
