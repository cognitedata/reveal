import { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { getIcon } from '@fdx/shared/utils/getIcon';

import { Body, Icon, Tooltip } from '@cognite/cogs.js';

import { Typography } from '../../Typography';

interface Props {
  header?: string;
  type?: string;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  alignActions?: 'left' | 'right';
}

export const WidgetHeader: React.FC<PropsWithChildren<Props>> = ({
  header,
  type,
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
          <Cell>
            {type && header && (
              <Tooltip content={type}>
                <StyledIcon size={16} type={getIcon(type)} />
              </Tooltip>
            )}
            <HeaderText>{header}</HeaderText>
          </Cell>

          <Cell>
            {type && !header && (
              <Tooltip content={type}>
                <StyledIcon type={getIcon(type)} />
              </Tooltip>
            )}
            <Typography.Title size="xsmall">{title}</Typography.Title>
          </Cell>

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
        `};

  width: 100%;
  display: flex;
  gap: 8px;
`;

const Content = styled.div`
  width: 80%;
`;

const Cell = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  & > * {
    min-width: 0;
  }

  .cogs-tooltip__content {
    display: flex;
  }
`;

const HeaderText = styled(Body)`
  font-size: 12px;
`;

const StyledIcon = styled(Icon)`
  height: 16px !important;
`;
