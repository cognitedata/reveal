import { PropsWithChildren } from 'react';
import styled from 'styled-components';

const Layout = ({ children }: PropsWithChildren<{}>) => {
  return <StyledContainer>{children}</StyledContainer>;
};

Layout.Container = styled.div`
  margin: 0 auto;
  width: 100%;
  padding: 0 16px;

  @media (min-width: 640px) {
    padding: 0 32px;
  }

  @media (min-width: 1240px) {
    padding: 0 48px;
  }

  @media (min-width: 1440px) {
    padding: 0 172px;
  }
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export default Layout;
