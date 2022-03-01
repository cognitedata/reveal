import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Flex } from '@cognite/cogs.js';

export const ToolbarContainer = styled(Flex)`
  background-color: #fff;
  padding: 10px;
  position: absolute;
  width: 100%;
  z-index: ${layers.MAIN_LAYER};
  gap: 18px;
`;

export const ToolbarItem = styled.div`
  margin: 0;
  box-sizing: border-box;
`;
