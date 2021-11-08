import React from 'react';
import styled from 'styled-components';

const Container = styled.div``;

const Wrapper = styled.div`
  display: flex;
  padding: 2.5rem;
  gap: 1.5rem;
  flex: 1;
`;

const WidgetContainer = styled.aside`
  width: 20rem;
  max-width: 20rem;
  min-width: 15rem;
`;

const Content = styled.section`
  width: 100vw;
  height: 100%;
`;

interface Props {
  Widget?: JSX.Element[] | JSX.Element;
  BottomNavigation?: JSX.Element[] | JSX.Element;
}
export const Page: React.FC<Props> = ({
  children,
  BottomNavigation,
  Widget,
}) => {
  return (
    <Container>
      <Wrapper>
        {Widget && <WidgetContainer>{Widget}</WidgetContainer>}
        <Content>{children}</Content>
      </Wrapper>
      {BottomNavigation && BottomNavigation}
    </Container>
  );
};
