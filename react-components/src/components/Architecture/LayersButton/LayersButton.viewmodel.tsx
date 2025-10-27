import { type ReactElement, useContext, type Dispatch, type SetStateAction } from 'react';
import { LayersButtonContext } from './LayersButton.context';
import { type LayersUrlStateParam } from './types';
import { type ModelLayerContent } from './ModelLayerContent';
import { type RevealDomainObject, type RevealRenderTarget } from '../../../architecture';

type ModelLayerSelectionProps = {
  label: string;
  domainObjects: RevealDomainObject[];
  renderTarget: RevealRenderTarget;
};

type UseLayersButtonViewModelResult = {
  modelLayerContent: ModelLayerContent;
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

  const modelLayerContent = useModelsVisibilityState();

  useSyncExternalLayersState(
    modelLayerContent,
    externalLayersState,
    setExternalLayersState,
    renderTarget
  );

  return {
    modelLayerContent,
    ModelLayerSelection,
    renderTarget
  };
}
