import styled from 'styled-components';
import { ModelLayersButton } from './ModelLayersButton';

import { useContext, type ReactElement } from 'react';
import { useTranslation } from '../../../i18n/I18n';
import { type LayersButtonProps } from '../LayersButton';
import { LayersButtonContext } from '../LayersButton.context';
import { use3DModelName } from '../../../../query/use3DModelName';

export const LayersButtonStrip = ({
  layersState: externalLayersState,
  setLayersState: setExternalLayersState
}: LayersButtonProps): ReactElement => {
  const { t } = useTranslation();

  const {
    useModelsVisibilityState,
    useSyncExternalLayersState,
    use3dModels,
    useReveal,
    useRenderTarget
  } = useContext(LayersButtonContext);

  const viewer = useReveal();
  const renderTarget = useRenderTarget();
  const models = use3dModels();

  const modelLayerHandlers = useModelsVisibilityState(
    setExternalLayersState,
    viewer,
    models,
    use3DModelName,
    renderTarget
  );
  const { cadHandlers, pointCloudHandlers, image360Handlers } = modelLayerHandlers;

  useSyncExternalLayersState(
    modelLayerHandlers,
    externalLayersState,
    setExternalLayersState,
    renderTarget
  );

  return (
    <ButtonsContainer>
      <ModelLayersButton
        icon={'Cube'}
        label={t({ key: 'CAD_MODELS' })}
        domainObjects={cadHandlers}
        renderTarget={renderTarget}
      />
      <ModelLayersButton
        icon={'PointCloud'}
        label={t({ key: 'POINT_CLOUDS' })}
        domainObjects={pointCloudHandlers}
        renderTarget={renderTarget}
      />
      <ModelLayersButton
        icon={'View360'}
        label={t({ key: 'IMAGES_360' })}
        domainObjects={image360Handlers}
        renderTarget={renderTarget}
      />
    </ButtonsContainer>
  );
};

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
