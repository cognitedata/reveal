import styled from 'styled-components';
import { ModelLayersButton } from './ModelLayersButton';

import { useCallback, useContext, type ReactElement } from 'react';
import { useTranslation } from '../../../i18n/I18n';
import { type LayersButtonProps } from '../LayersButton';
import { LayersButtonContext } from '../LayersButton.context';
import { use3DModelName } from '../../../../query/use3DModelName';
import { useRenderTarget } from '../../../RevealCanvas';

export const LayersButtonStrip = ({
  layersState: externalLayersState,
  setLayersState: setExternalLayersState
}: LayersButtonProps): ReactElement => {
  const { t } = useTranslation();

  const { useModelHandlers, useSyncExternalLayersState, use3dModels, useReveal } =
    useContext(LayersButtonContext);

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
  const { cadHandlers, pointCloudHandlers, image360Handlers } = modelLayerHandlers;

  useSyncExternalLayersState(
    modelLayerHandlers,
    externalLayersState,
    setExternalLayersState,
    renderTarget
    // update
  );

  /* const updateCallback = useCallback(() => {
    update();
  }, [viewer, update]); */

  return (
    <ButtonsContainer>
      <ModelLayersButton
        icon={'Cube'}
        label={t({ key: 'CAD_MODELS' })}
        domainObjects={cadHandlers}
        renderTarget={renderTarget}
        // update={updateCallback}
      />
      <ModelLayersButton
        icon={'PointCloud'}
        label={t({ key: 'POINT_CLOUDS' })}
        domainObjects={pointCloudHandlers}
        renderTarget={renderTarget}
        // update={updateCallback}
      />
      <ModelLayersButton
        icon={'View360'}
        label={t({ key: 'IMAGES_360' })}
        domainObjects={image360Handlers}
        renderTarget={renderTarget}
        // update={updateCallback}
      />
    </ButtonsContainer>
  );
};

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
