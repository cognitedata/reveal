/*!
 * Copyright 2025 Cognite AS
 */
import { type Dispatch, type SetStateAction } from 'react';
import { useModelHandlers } from './useModelHandlers';
import { useSyncExternalLayersState } from './useSyncExternalLayersState';
import { type ModelHandler } from './ModelHandler';
import { type DefaultLayersConfiguration, type LayersUrlStateParam } from './types';
import { type Signal } from '@cognite/signals';

export class LayersButtonViewModel {
  public modelLayerHandlers: Signal<{
    cadHandlers: ModelHandler[];
    pointCloudHandlers: ModelHandler[];
    image360Handlers: ModelHandler[];
  }>;

  public updateCallback: Signal<() => void>;

  constructor(
    setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
    defaultLayerConfiguration: DefaultLayersConfiguration | undefined,
    externalLayersState: LayersUrlStateParam | undefined
  ) {
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
    this.modelLayerHandlers = modelLayerHandlers;
    this.updateCallback = update;
  }
}
