import { Button } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const Header = styled.header`
  min-height: 10vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: var(--cogs-greyscale-grey7);
  padding: 20px;
`;

export const FullWidthButton = styled(Button)`
  width: 100%;
`;
