import { PropsWithChildren } from 'react';

import styled from 'styled-components';

import { Body, Title } from '@cognite/cogs.js';

interface Props {
  header?: string;
  title?: string | React.ReactNode;
  subtitle?: string;
  alignActions?: 'left' | 'right';
}

export const WidgetHeader: React.FC<PropsWithChildren<Props>> = ({
  header,
  title,
  subtitle,
  children,
  alignActions,
}) => {
  const actionsAlignment =
    alignActions || (!title && !subtitle ? 'left' : 'right');

  return (
    <Container>
      {(header || title || subtitle) && (
        <Content>
          <HeaderText>{header}</HeaderText>
          <Title level={6}>{title}</Title>
          <Body level={6}>{subtitle}</Body>
        </Content>
      )}

      <Actions align={actionsAlignment}>{children}</Actions>
    </Container>
  );
};

const Container = styled.div`
  min-height: 52px;
  display: flex;
  padding: 24px 16px;

  flex-direction: row;
  align-items: center;
`;

const Actions = styled.div<{ align: 'left' | 'right' }>`
  ${({ align }) =>
    align === 'left' ? 'margin-right: auto;' : 'margin-left: auto;'}

  display: flex;
  gap: 8px;
`;

const Content = styled.span``;

const HeaderText = styled(Body)`
  font-size: 12px;
`;
