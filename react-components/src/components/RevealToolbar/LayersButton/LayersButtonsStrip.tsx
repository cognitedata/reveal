/*!
 * Copyright 2024 Cognite AS
 */

import styled from 'styled-components';
import { ModelLayersButton } from './ModelLayersButton';

import { useCallback, type ReactElement } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { useModelHandlers } from './useModelHandlers';
import { useSyncExternalLayersState } from './useSyncExternalLayersState';
import { type LayersButtonProps } from './LayersButton';
import { useReveal } from '../../RevealCanvas/ViewerContext';
import { useSignalValue } from '@cognite/signals/react';

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
  const { cadHandlers, pointCloudHandlers, image360Handlers } = useSignalValue(modelLayerHandlers);

  useSyncExternalLayersState(
    useSignalValue(modelLayerHandlers),
    externalLayersState,
    setExternalLayersState,
    update
  );

  const viewer = useReveal();
  const updateCallback = useCallback(() => {
    update();
  }, [viewer, update]);

  return (
    <ButtonsContainer>
      <ModelLayersButton
        icon={'Cube'}
        label={t({ key: 'CAD_MODELS' })}
        handlers={cadHandlers}
        update={updateCallback}
      />
      <ModelLayersButton
        icon={'PointCloud'}
        label={t({ key: 'POINT_CLOUDS' })}
        handlers={pointCloudHandlers}
        update={updateCallback}
      />
      <ModelLayersButton
        icon={'View360'}
        label={t({ key: 'IMAGES_360' })}
        handlers={image360Handlers}
        update={updateCallback}
      />
    </ButtonsContainer>
  );
};

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
