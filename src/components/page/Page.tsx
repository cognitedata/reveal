import { Breadcrumb } from 'src/components/Breadcrumb';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
`;

const BottomContainer = styled.div`
  position: relative;
  bottom: 0;
  align-self: flex-end;
  width: 100%;
  height: 4rem;
  border-top: 1px solid var(--cogs-greyscale-grey4);
  padding: 14px 32px;
  background-color: white;
`;

const Wrapper = styled.div`
  display: flex;
  padding: 2.5rem;
  padding-top: 3.5rem;
  padding-bottom: 0;
  gap: 2.5rem;
  height: 100%;
  overflow-y: hidden;
`;

const WidgetContainer = styled.aside`
  position: sticky;
  top: 0;
  width: 20rem;
  max-width: 20rem;
  min-width: 15rem;
  height: 100%;
`;

const Content = styled.section`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: scroll;
`;

interface Props {
  Widget?: JSX.Element[] | JSX.Element;
  BottomNavigation?: JSX.Element[] | JSX.Element;
  breadcrumbs?: { title: string; onClick?: () => void }[];
}

export const Page: React.FC<Props> = ({
  children,
  BottomNavigation,
  Widget,
  breadcrumbs,
}) => {
  return (
    <Container>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <Wrapper>
        {Widget && <WidgetContainer>{Widget}</WidgetContainer>}
        <Content>{children}</Content>
      </Wrapper>
      {BottomNavigation && (
        <BottomContainer>{BottomNavigation}</BottomContainer>
      )}
    </Container>
  );
};
