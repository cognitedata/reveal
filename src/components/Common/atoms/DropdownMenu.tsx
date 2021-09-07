import styled from 'styled-components';
import { Flex } from 'components/Common/atoms/Flex';

export const DropdownMenu = styled(Flex)`
  flex-direction: column;
  align-items: flex-start;
  border-radius: 8px;
  padding: 8px;
  background-color: white;
  box-shadow: 0 0 5px grey;
  width: auto;
  & > * {
    flex: 1 1 0px;
    width: 100%;
    justify-content: flex-start;
  }
`;
