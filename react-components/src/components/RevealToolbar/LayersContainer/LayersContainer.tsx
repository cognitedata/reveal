/*!
 * Copyright 2023 Cognite AS
 */

import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { CadModelLayersContainer } from './CadModelLayersContainer';
import { Image360CollectionLayerContainer } from './Image360LayersContainer';
import { PointCloudLayersContainer } from './PointCloudLayersContainer';
import { useState, type ReactElement, useEffect, type MouseEvent } from 'react';
import { type Reveal3DResourcesLayerStates, type Reveal3DResourcesLayersProps } from './types';
import { useReveal } from '../../RevealContainer/RevealContext';
import { useLayersUrlParams } from '../../../hooks/useUrlStateParam';

const LayersContainer = ({ props }: { props: Reveal3DResourcesLayersProps }): ReactElement => {
  const viewer = useReveal();
  const [, setLayersUrlState] = useLayersUrlParams();
  const [layersContainerState, setLayersContainerState] = useState<Reveal3DResourcesLayerStates>({
    cadLayerData: [],
    pointCloudLayerData: [],
    image360LayerData: []
  });

  useEffect(() => {
    const { cadLayerData, pointCloudLayerData, image360LayerData } = layersContainerState;
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
    setLayersUrlState({
      cadLayers,
      pointCloudLayers,
      image360Layers
    });
  }, [layersContainerState]);

  return (
    <>
      {(viewer.models.length > 0 || viewer.get360ImageCollections().length > 0) && (
        <Container>
          <StyledMenu
            onClick={(event: MouseEvent<HTMLElement>) => {
              event.stopPropagation();
            }}>
            <CadModelLayersContainer
              layerProps={props}
              onChange={(cadLayerData: Reveal3DResourcesLayerStates['cadLayerData']) => {
                setLayersContainerState((prev) => ({ ...prev, cadLayerData }));
              }}
            />
            <PointCloudLayersContainer
              layerProps={props}
              onChange={(
                pointCloudLayerData: Reveal3DResourcesLayerStates['pointCloudLayerData']
              ) => {
                setLayersContainerState((prev) => ({ ...prev, pointCloudLayerData }));
              }}
            />
            <Image360CollectionLayerContainer
              layerProps={props}
              onChange={(image360LayerData: Reveal3DResourcesLayerStates['image360LayerData']) => {
                setLayersContainerState((prev) => ({ ...prev, image360LayerData }));
              }}
            />
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
