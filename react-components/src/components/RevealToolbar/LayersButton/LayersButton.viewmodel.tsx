import { type ReactElement, useContext, type Dispatch, type SetStateAction } from 'react';
import { LayersButtonContext } from './LayersButton.context';
import { type ModelLayerHandlers, type LayersUrlStateParam } from './types';
import { type ModelHandler } from './ModelHandler';
import { use3DModelName } from '../../../query';
import { RevealDomainObject, RevealRenderTarget } from '../../../architecture';

type UpdateCallback = () => void;

type ModelLayerSelectionProps = {
  label: string;
  domainObjects: RevealDomainObject[];
  // update: UpdateCallback;
  renderTarget: RevealRenderTarget;
};

type UseLayersButtonViewModelResult = {
  modelLayerHandlers: ModelLayerHandlers;
  // updateCallback: UpdateCallback;
  ModelLayerSelection: (props: ModelLayerSelectionProps) => ReactElement;
};

export function useLayersButtonViewModel(
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  externalLayersState: LayersUrlStateParam | undefined
): UseLayersButtonViewModelResult {
  const {
    useModelHandlers,
    useSyncExternalLayersState,
    ModelLayerSelection,
    use3dModels,
    useReveal,
    useRenderTarget
  } = useContext(LayersButtonContext);

  const viewer = useReveal();
  const renderTarget = useRenderTarget();
  const models = use3dModels();

  const modelLayerHandlers = useModelHandlers(
    setExternalLayersState,
    viewer,
    models,
    use3DModelName,
    renderTarget
  );

  useSyncExternalLayersState(
    modelLayerHandlers,
    externalLayersState,
    setExternalLayersState,
    renderTarget
    // update
  );

  return {
    modelLayerHandlers,
    // updateCallback: update,
    ModelLayerSelection
  };
}
