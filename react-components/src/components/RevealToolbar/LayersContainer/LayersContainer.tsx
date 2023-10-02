/*!
 * Copyright 2023 Cognite AS
 */

import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { CadModelLayersContainer } from './CadModelLayersContainer';
import { Image360CollectionLayerContainer } from './Image360LayersContainer';
import { PointCloudLayersContainer } from './PointCloudLayersContainer';
import { type ReactElement } from 'react';
import { type Reveal3DResourcesLayerStates, type Reveal3DResourcesLayersProps } from './types';
import { useReveal } from '../../RevealContainer/RevealContext';
import { useUrlStateParam } from '../../../hooks/useUrlStateParam';

const LayersContainer = ({ props }: { props: Reveal3DResourcesLayersProps }): ReactElement => {
  const viewer = useReveal();
  const urlParam = useUrlStateParam();

  const setUrl = (layerData: Reveal3DResourcesLayerStates): void => {
    const { cadLayerData, pointCloudLayerData, image360LayerData } = layerData;
    const cadLayers = cadLayerData.map((data) => {
      const index = viewer.models.indexOf(data.model);
      return {
        revisionId: data.model.revisionId,
        applied: data.isToggled,
        index
      };
    });
    const pointCloudLayers = pointCloudLayerData.map((data) => {
      const index = viewer.models.indexOf(data.model);
      return {
        revisionId: data.model.revisionId,
        applied: data.isToggled,
        index
      };
    });

    const image360Layers = image360LayerData.map((data) => {
      return {
        siteId: data.image360.id,
        applied: data.isToggled
      };
    });
    urlParam.setUrlParamOnLayersChanged({
      cadLayers,
      pointCloudLayers,
      image360Layers
    });
  };
  return (
    <>
      {(viewer.models.length > 0 || viewer.get360ImageCollections().length > 0) && (
        <Container>
          <StyledMenu
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
            }}>
            <CadModelLayersContainer layerProps={props} setUrl={setUrl} />
            <PointCloudLayersContainer layerProps={props} setUrl={setUrl} />
            <Image360CollectionLayerContainer layerProps={props} setUrl={setUrl} />
          </StyledMenu>
        </Container>
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

export default LayersContainer;
