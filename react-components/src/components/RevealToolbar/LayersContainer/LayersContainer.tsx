/*!
 * Copyright 2023 Cognite AS
 */

import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { CadModelLayersContainer } from './CadModelLayersContainer';
import { Image360CollectionLayerContainer } from './Image360LayersContainer';
import { PointCloudLayersContainer } from './PointCloudLayersContainer';
import { type ReactElement } from 'react';
import { type Reveal3DResourcesLayersProps } from './types';
import { useReveal } from '../../RevealContainer/RevealContext';

const LayersContainer = ({ props }: { props: Reveal3DResourcesLayersProps }): ReactElement => {
  const viewer = useReveal();
  return (
    <>
      {(viewer.models.length > 0 || viewer.get360ImageCollections().length > 0) && (
        <Container>
          <StyledMenu
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
            }}>
            <CadModelLayersContainer layerProps={props} />
            <PointCloudLayersContainer layerProps={props} />
            <Image360CollectionLayerContainer layerProps={props} />
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
