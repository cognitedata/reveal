import { Body, Title } from '@cognite/cogs.js';
import { PropsWithChildren } from 'react';
import styled from 'styled-components';

interface Props {
  title: string;
  subtitle?: string;
}

export const WidgetHeader: React.FC<PropsWithChildren<Props>> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <Container>
      <Content>
        <Title level={6}>{title}</Title>
        <Body level={6}>{subtitle}</Body>
      </Content>

      <Actions>{children}</Actions>
    </Container>
  );
};

const Container = styled.div`
  min-height: 52px;
  display: flex;
  padding: 24px 16px;
  justify-content: center;

  flex-direction: row;
  align-items: center;
`;

const Actions = styled.div`
  margin-left: auto;
  display: flex;
  gap: 8px;
`;

const Content = styled.span``;
