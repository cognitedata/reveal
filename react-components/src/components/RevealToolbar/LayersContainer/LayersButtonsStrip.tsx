/*!
 * Copyright 2024 Cognite AS
 */
import styled from 'styled-components';
import {
  type CadModelHandler,
  type Image360CollectionHandler,
  type PointCloudModelHandler
} from './ModelHandler';
import { ModelLayersButton } from './ModelLayersButton';

import { type ReactElement } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { useModelHandlers } from './useModelHandlers';
import { useSyncExternalLayersState } from './useSyncExternalLayersState';
import { type LayersButtonProps } from '../LayersButton';

export type ModelLayerHandlers = {
  cadHandlers: CadModelHandler[];
  pointCloudHandlers: PointCloudModelHandler[];
  image360Handlers: Image360CollectionHandler[];
};

export const LayersButtonStrip = ({
  layersState: externalLayersState,
  setLayersState: setExternalLayersState,
  defaultLayerConfiguration
}: LayersButtonProps): ReactElement => {
  const { t } = useTranslation();
  const [modelLayerHandlers, update] = useModelHandlers(
    setExternalLayersState,
    defaultLayerConfiguration
  );
  const { cadHandlers, pointCloudHandlers, image360Handlers } = modelLayerHandlers;

  useSyncExternalLayersState(
    modelLayerHandlers,
    externalLayersState,
    setExternalLayersState,
    update
  );

  return (
    <ButtonsContainer>
      <ModelLayersButton
        icon="Cube"
        label={t('CAD_MODELS', 'CAD models')}
        handlers={cadHandlers}
        update={update}
      />
      <ModelLayersButton
        icon="PointCloud"
        label={t('POINT_CLOUDS', 'Point clouds')}
        handlers={pointCloudHandlers}
        update={update}
      />
      <ModelLayersButton
        icon="View360"
        label={t('IMAGES_360', '360 images')}
        handlers={image360Handlers}
        update={update}
      />
    </ButtonsContainer>
  );
};

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
