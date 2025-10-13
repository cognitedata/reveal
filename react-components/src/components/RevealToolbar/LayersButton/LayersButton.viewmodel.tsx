import { type ReactElement, useContext, type Dispatch, type SetStateAction } from 'react';
import { LayersButtonContext } from './LayersButton.context';
import { type ModelLayerHandlers, type LayersUrlStateParam } from './types';
import { RevealDomainObject, RevealRenderTarget } from '../../../architecture';

type ModelLayerSelectionProps = {
  label: string;
  domainObjects: RevealDomainObject[];
  renderTarget: RevealRenderTarget;
};

type UseLayersButtonViewModelResult = {
  modelLayerHandlers: ModelLayerHandlers;
  ModelLayerSelection: (props: ModelLayerSelectionProps) => ReactElement;
  renderTarget: RevealRenderTarget;
};

export function useLayersButtonViewModel(
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  externalLayersState: LayersUrlStateParam | undefined
): UseLayersButtonViewModelResult {
  const {
    useModelsVisibilityState,
    useSyncExternalLayersState,
    ModelLayerSelection,
    useRenderTarget
  } = useContext(LayersButtonContext);

  const renderTarget = useRenderTarget();

  const modelLayerHandlers = useModelsVisibilityState(setExternalLayersState, renderTarget);

  useSyncExternalLayersState(
    modelLayerHandlers,
    externalLayersState,
    setExternalLayersState,
    renderTarget
  );

  return {
    modelLayerHandlers,
    ModelLayerSelection,
    renderTarget
  };
}
