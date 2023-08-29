import { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { Body } from '@cognite/cogs.js';

import { Typography } from '../../Typography';

interface Props {
  header?: string;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
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
          <Typography.Title size="xsmall">{title}</Typography.Title>
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
  width: 100%;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Actions = styled.div<{ align: 'left' | 'right' }>`
  ${({ align }) =>
    align === 'left'
      ? css`
          justify-content: flex-start;
        `
      : css`
          justify-content: flex-end;
        `}

  width: 100%;
  display: flex;
  gap: 8px;
`;

const Content = styled.div`
  width: 80%;
`;

const HeaderText = styled(Body)`
  font-size: 12px;
`;
