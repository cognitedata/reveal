import styled from 'styled-components';
import { ModelLayersButton } from './ModelLayersButton2';

import { useContext, type ReactElement } from 'react';
import { useTranslation } from '../../../i18n/I18n';
import { type LayersButtonProps } from '../LayersButton2';
import { LayersButtonContext } from '../LayersButton2.context';

export const LayersButtonStrip = ({
  layersState: externalLayersState,
  setLayersState: setExternalLayersState
}: LayersButtonProps): ReactElement => {
  const { t } = useTranslation();

  const { useModelsVisibilityState, useSyncExternalLayersState, useRenderTarget } =
    useContext(LayersButtonContext);

  const renderTarget = useRenderTarget();

  const modelLayerContent = useModelsVisibilityState();
  const { cadModels, pointClouds, image360Collections } = modelLayerContent;

  useSyncExternalLayersState(
    modelLayerContent,
    externalLayersState,
    setExternalLayersState,
    renderTarget
  );

  return (
    <ButtonsContainer>
      <ModelLayersButton
        icon={'Cube'}
        label={t({ key: 'CAD_MODELS' })}
        domainObjects={cadModels}
        renderTarget={renderTarget}
      />
      <ModelLayersButton
        icon={'PointCloud'}
        label={t({ key: 'POINT_CLOUDS' })}
        domainObjects={pointClouds}
        renderTarget={renderTarget}
      />
      <ModelLayersButton
        icon={'View360'}
        label={t({ key: 'IMAGES_360' })}
        domainObjects={image360Collections}
        renderTarget={renderTarget}
      />
    </ButtonsContainer>
  );
};

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
