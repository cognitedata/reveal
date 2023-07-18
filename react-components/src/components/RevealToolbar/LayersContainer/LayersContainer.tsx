/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';

import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components';

import { CadModelLayersContainer } from './CadModelLayersContainer';
import { PointCloudLayersContainer } from './PointCloudLayersContainer';

export const LayersContainer = (): ReactElement => {
  return (
    <Container>
      <StyleMenu>
        <CadModelLayersContainer />
        <PointCloudLayersContainer />
      </StyleMenu>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  left: calc(0%);
  top: calc(-70%);
`;

const StyleMenu = styled(Menu)`
  display: flex;
  flex-direction: column;
  padding: 0px 0px 0px 0px;
`;
