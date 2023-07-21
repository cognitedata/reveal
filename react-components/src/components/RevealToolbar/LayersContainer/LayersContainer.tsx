/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';

import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components';

import { CadModelLayersContainer } from './CadModelLayersContainer';
import { PointCloudLayersContainer } from './PointCloudLayersContainer';
import { Image360CollectionLayerContainer } from './Image360LayersContainer';

export const LayersContainer = (): ReactElement => {
  return (
    <Container>
      <StyledMenu>
        <CadModelLayersContainer />
        <PointCloudLayersContainer />
        <Image360CollectionLayerContainer />
      </StyledMenu>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  left: calc(0%);
  top: calc(-70%);
`;

const StyledMenu = styled(Menu)`
  padding: 6px;
  width: 214px;
`;
