import styled from 'styled-components';

export const Layout = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row-reverse;
  background-color: var(--cogs-greyscale-grey2);
`;

export const Main = styled.div`
  background-color: var(--cogs-greyscale-grey2);
  flex-grow: 1;
`;

export const Content = styled.main`
  padding: 32px 48px;
`;
