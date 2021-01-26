import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

export const PageWrapper = styled.div`
  flex: 1;
  height: 100%;
  background-color: ${Colors.white.hex()};
  display: grid;
  grid-template-areas:
    'title links'
    'main main';
  grid-template-rows: min-content;
  h1 {
    grid-area: title;
    margin: 1.5rem 0 1.5rem 2rem;
    align-self: center;
  }
`;
