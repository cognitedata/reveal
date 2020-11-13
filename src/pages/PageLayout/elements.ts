import styled from 'styled-components/macro';
import layers from '_helpers/zindex';

export const Navigation = styled.div`
  position: sticky;
  top: 0;
  background-color: var(--cogs-white);
  z-index: ${layers.APP_HEADER};
`;

export const Content = styled.div`
  height: 100%;
  min-height: 100vh;
  background-color: var(--cogs-greyscale-grey2);
`;
