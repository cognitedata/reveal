import styled from 'styled-components';

import { Flex } from '@interactive-diagrams-app/components/Common/atoms/Flex';

import { Colors } from '@cognite/cogs.js';

export const DropdownMenu = styled(Flex)`
  flex-direction: column;
  align-items: flex-start;
  border-radius: 8px;
  padding: 8px 4px;
  background-color: white;
  box-shadow: 0 0 10px ${Colors['decorative--grayscale--300']};
  width: auto;
  & > * {
    flex: 1 1 0px;
    width: 100%;
    justify-content: flex-start;
  }
`;
