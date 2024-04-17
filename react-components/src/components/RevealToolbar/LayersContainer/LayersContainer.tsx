/*!
 * Copyright 2023 Cognite AS
 */

import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { LayerToggleDropdown } from './LayerToggleDropdown';
import { type ReactElement, type MouseEvent } from 'react';
import { useReveal } from '../../RevealCanvas/ViewerContext';
import { type ModelLayerHandlers } from './LayersButtonsStrip';
import { useTranslation } from '../../i18n/I18n';
import { type UpdateModelHandlersCallback } from './useModelHandlers';

export const LayersContainer = ({
  modelHandlers,
  update
}: {
  modelHandlers: ModelLayerHandlers;
  update: UpdateModelHandlersCallback;
}): ReactElement => {
  const viewer = useReveal();
  const { t } = useTranslation();

  return (
    <>
      {(viewer.models.length > 0 || viewer.get360ImageCollections().length > 0) && (
        <>
          <Container>
            <StyledMenu
              onClick={(event: MouseEvent<HTMLElement>) => {
                event.stopPropagation();
              }}>
              <LayerToggleDropdown
                layerHandlers={modelHandlers.cadHandlers}
                update={update}
                label={t('CAD_MODELS', 'CAD models')}
              />
              <LayerToggleDropdown
                layerHandlers={modelHandlers.pointCloudHandlers}
                update={update}
                label={t('POINT_CLOUDS', 'Pointclouds')}
              />
              <LayerToggleDropdown
                layerHandlers={modelHandlers.image360Handlers}
                update={update}
                label={t('360_IMAGES', '360 images')}
              />
            </StyledMenu>
          </Container>
        </>
      )}
    </>
  );
};

const Container = styled.div`
  position: relative;
`;

const StyledMenu = styled(Menu)`
  padding: 6px;
  width: 214px;
  border: 1px solid rgba(83, 88, 127, 0.24);
`;
