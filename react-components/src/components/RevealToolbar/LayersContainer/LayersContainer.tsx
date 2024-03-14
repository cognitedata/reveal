/*!
 * Copyright 2023 Cognite AS
 */

import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { LayerToggleDropdown } from './LayerToggleDropdown';
import {
  // useState,
  type ReactElement,
  // useEffect,
  type MouseEvent
  // type SetStateAction,
  // type Dispatch
} from 'react';
import { useReveal } from '../../RevealCanvas/ViewerContext';
// import { useLayersUrlParams } from '../hooks/useUrlStateParam';
import { type ModelLayerHandlers } from '../../RevealTopbar/LayersStrip/LayersButtonsStrip';
import { useTranslation } from '../../i18n/I18n';

export const LayersContainer = ({
  modelHandlers,
  update
}: {
  modelHandlers: ModelLayerHandlers;
  update: () => void;
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

// const useStoreStateToUrl = (
//   enable: boolean
// ): [Reveal3DResourcesLayerStates, Dispatch<SetStateAction<Reveal3DResourcesLayerStates>>] => {
//   const viewer = useReveal();

//   const [, setLayersUrlState] = useLayersUrlParams();
//   const [layersContainerState, setLayersContainerState] = useState<Reveal3DResourcesLayerStates>({
//     cadLayerData: [],
//     pointCloudLayerData: [],
//     image360LayerData: []
//   });

//   useEffect(() => {
//     if (!enable) {
//       return;
//     }

//     const { cadLayerData, pointCloudLayerData, image360LayerData } = layersContainerState;

//     const cadLayers = cadLayerData.map((data) => {
//       const index = viewer.models.indexOf(data.model);
//       return {
//         revisionId: data.model.revisionId,
//         applied: data.isToggled,
//         index
//       };
//     });

//     const pointCloudLayers = pointCloudLayerData.map((data) => {
//       const index = viewer.models.indexOf(data.model);
//       return {
//         revisionId: data.model.revisionId,
//         applied: data.isToggled,
//         index
//       };
//     });

//     const image360Layers = image360LayerData.map((data) => {
//       return {
//         siteId: data.model.id,
//         applied: data.isToggled
//       };
//     });

//     setLayersUrlState({
//       cadLayers,
//       pointCloudLayers,
//       image360Layers
//     });
//   }, [layersContainerState]);

//   return [layersContainerState, setLayersContainerState];
// };

const Container = styled.div`
  position: relative;
`;

const StyledMenu = styled(Menu)`
  padding: 6px;
  width: 214px;
  border: 1px solid rgba(83, 88, 127, 0.24);
`;
