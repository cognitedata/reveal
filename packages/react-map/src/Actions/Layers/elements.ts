import styled from 'styled-components';
import { Menu } from '@cognite/cogs.js';

export const LayerWrapper = styled(Menu)`
  min-width: 256px;
`;

export const LayerItem = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;
