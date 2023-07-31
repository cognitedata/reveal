/*!
 * Copyright 2023 Cognite AS
 */

import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { CadModelLayersContainer } from './CadModelLayersContainer';
import { Image360CollectionLayerContainer } from './Image360LayersContainer';
import { PointCloudLayersContainer } from './PointCloudLayersContainer';
import { type ReactElement } from 'react';
import {
  type Reveal3DResourcesStates,
  type LayerStates,
  type SetLayerStates,
  type SetReveal3DResourcesStates
} from './types';

const LayersContainer = ({
  layerStates,
  setLayerStates,
  reveal3DResources,
  setReveal3DResources
}: {
  layerStates: LayerStates;
  setLayerStates: SetLayerStates;
  reveal3DResources: Reveal3DResourcesStates;
  setReveal3DResources: SetReveal3DResourcesStates;
}): ReactElement => {
  return (
    <Container>
      <StyledMenu>
        <CadModelLayersContainer
          selectedCadModels={reveal3DResources.cadModels}
          setSelectedCadModels={(value) => {
            setReveal3DResources({ ...reveal3DResources, cadModels: value });
          }}
          allCadModelVisible={layerStates.allCadModelVisible}
          setAllCadModelVisible={(value) => {
            setLayerStates({ ...layerStates, allCadModelVisible: value });
          }}
          cadIndeterminate={layerStates.cadIndeterminate}
          setCadIndeterminate={(value) => {
            setLayerStates({ ...layerStates, cadIndeterminate: value });
          }}
        />
        <PointCloudLayersContainer
          selectedPointCloudModels={reveal3DResources.pointCloudModels}
          setSelectedPointCloudModels={(value) => {
            setReveal3DResources({ ...reveal3DResources, pointCloudModels: value });
          }}
          allPointCloudModelVisible={layerStates.allPointCloudModelVisible}
          setAllPointCloudModelVisible={(value) => {
            setLayerStates({ ...layerStates, allPointCloudModelVisible: value });
          }}
          indeterminate={layerStates.pointCloudIndeterminate}
          setIndeterminate={(value) => {
            setLayerStates({ ...layerStates, pointCloudIndeterminate: value });
          }}
        />
        <Image360CollectionLayerContainer
          selectedImage360Collection={reveal3DResources.image360Collections}
          setSelectedImage360Collection={(value) => {
            setReveal3DResources({ ...reveal3DResources, image360Collections: value });
          }}
          allImages360Visible={layerStates.allImages360Visible}
          setAllImages360Visible={(value) => {
            setLayerStates({ ...layerStates, allImages360Visible: value });
          }}
          indeterminate={layerStates.image360Indeterminate}
          setIndeterminate={(value) => {
            setLayerStates({ ...layerStates, image360Indeterminate: value });
          }}
        />
      </StyledMenu>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  top: 40px;
`;

const StyledMenu = styled(Menu)`
  padding: 6px;
  width: 214px;
`;

export default LayersContainer;
