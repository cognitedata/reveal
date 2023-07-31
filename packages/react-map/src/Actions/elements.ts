import styled from 'styled-components';

import { sizes } from '../elements';

export const BaseContainer = styled.div`
  display: flex;
  height: 40px;
  border-radius: ${sizes.small};
  background-color: white;
  align-items: center;
  box-shadow: var(--cogs-z-4);
  padding: 2px;
`;

export const ActionContainer = styled(BaseContainer)`
  position: relative;
`;

export const ButtonContainer = styled(BaseContainer)``;
