/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactNode, type PropsWithChildren, type FC, type ReactElement } from 'react';

import styled, { css } from 'styled-components';

import { Body, Icon, Tooltip } from '@cognite/cogs.js';

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

  return (
    <Container className="widget-header">
      {Boolean(header ?? title ?? subtitle) && (
        <Content>
          <Cell>
            {type !== undefined && header !== undefined && (
              <Tooltip content={type}>
                <StyledIcon size={16} type={'Component'} />
              </Tooltip>
            )}
            <div>
              <HeaderText>{header}</HeaderText>
              <Body size="small">{subtitle}</Body>
            </div>
          </Cell>
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
  padding: 10px;
`;

const Content = styled.div`
  width: 70%;
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
  font-size: 14px;
  font-weight: bold;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledIcon = styled(Icon)`
  height: 16px !important;
  size: 36px !important;
`;
