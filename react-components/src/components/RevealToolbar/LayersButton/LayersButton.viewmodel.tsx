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
import { type ModelHandler } from './ModelHandler';

type UpdateCallback = () => void;

type ModelLayerSelectionProps = {
  label: string;
  modelLayerHandlers: ModelHandler[];
  update: UpdateCallback;
};

type UseLayersButtonViewModelResult = {
  modelLayerHandlers: ModelLayerHandlers;
  updateCallback: UpdateCallback;
  ModelLayerSelection: (props: ModelLayerSelectionProps) => ReactElement;
};

export function useLayersButtonViewModel(
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  defaultLayerConfiguration: DefaultLayersConfiguration | undefined,
  externalLayersState: LayersUrlStateParam | undefined
): UseLayersButtonViewModelResult {
  const {
    useModelHandlers,
    useSyncExternalLayersState,
    ModelLayerSelection,
    use3dModels,
    useReveal
  } = useContext(LayersButtonContext);

  const [modelLayerHandlers, update] = useModelHandlers(
    setExternalLayersState,
    defaultLayerConfiguration,
    useReveal(),
    use3dModels()
  );

  useSyncExternalLayersState(
    modelLayerHandlers,
    externalLayersState,
    setExternalLayersState,
    update
  );

  return {
    modelLayerHandlers,
    updateCallback: update,
    ModelLayerSelection
  };
}
