/*!
 * Copyright 2025 Cognite AS
 */
import { type ReactElement, type Dispatch, type SetStateAction, useContext } from 'react';
import { LayersButtonContext } from './LayersButton.context';
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
  public ModelLayerSelection: ({
    label,
    modelLayerHandlers,
    update
  }: {
    label: string;
    modelLayerHandlers: ModelHandler[];
    update: () => void;
  }) => ReactElement;

  constructor(
    setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
    defaultLayerConfiguration: DefaultLayersConfiguration | undefined,
    externalLayersState: LayersUrlStateParam | undefined
  ) {
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
    this.modelLayerHandlers = modelLayerHandlers;
    this.updateCallback = update;
    this.ModelLayerSelection = ModelLayerSelection;
  }
}
