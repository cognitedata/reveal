/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactNode, type PropsWithChildren, type FC, type ReactElement } from 'react';

import styled, { css } from 'styled-components';

import { Body, Icon, type IconType, Tooltip } from '@cognite/cogs.js';

type Props = {
  header?: string;
  type?: string;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  alignActions?: 'left' | 'right';
};

export const WidgetHeader: FC<PropsWithChildren<Props>> = ({
  header,
  type,
  title,
  subtitle,
  children,
  alignActions
}): ReactElement => {
  const actionsAlignment = alignActions ?? 'right';
  const getIcon = (type: string): IconType => {
    switch (type) {
      case 'workorders':
        return 'WorkOrders';
      case 'assets':
        return 'Assets';
      case 'document':
        return 'Document';
      case 'timeseries':
        return 'Timeseries';
      default:
        return 'Component';
    }
  };

  return (
    <Container>
      {Boolean(header ?? title ?? subtitle) && (
        <Content>
          <Cell>
            {type !== undefined && header !== undefined && (
              <Tooltip content={type}>
                <StyledIcon size={16} type={getIcon(type)} />
              </Tooltip>
            )}
            <HeaderText>{header}</HeaderText>
          </Cell>

          <Cell>
            {type !== undefined && header === undefined && (
              <Tooltip content={type}>
                <StyledIcon type={getIcon(type)} />
              </Tooltip>
            )}
            {/* TODO: Fix this */}
          </Cell>

          <Body level={6}>{subtitle}</Body>
        </Content>
      )}

      <Actions align={actionsAlignment}>{children}</Actions>
    </Container>
  );
};

const Container = styled.div`
  min-height: 48px;
  display: flex;
  padding: 0px 0px 0px 10px;

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
