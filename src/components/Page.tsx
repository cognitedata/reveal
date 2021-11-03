import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  padding: 2.5rem;
  gap: 1.5rem;
`;

const WidgetContainer = styled.aside`
  width: 20rem;
`;

const Content = styled.section`
  width: 100%;
  height: 100%;
`;

interface Props {
  Widget?: JSX.Element[] | JSX.Element;
}
export const Page: React.FC<Props> = ({ children, Widget }) => {
  return (
    <Container>
      {Widget && <WidgetContainer>{Widget}</WidgetContainer>}
      <Content>{children}</Content>
    </Container>
  );
};
