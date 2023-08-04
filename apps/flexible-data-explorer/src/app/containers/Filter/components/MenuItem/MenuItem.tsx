import * as React from 'react';

import { Icon, IconType } from '@cognite/cogs.js';

import { Typography } from '../../../../components/Typography';

import { Content, TextContent, Title } from './elements';

const TEXT_CONTENT_WIDTH = 200;
const ICON_WIDTH = 24;

export interface MenuItemProps {
  title: string;
  subtitle?: string;
  icon?: IconType;
  onClick?: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  title,
  subtitle,
  icon,
  onClick,
}) => {
  const textContentWidth = icon
    ? TEXT_CONTENT_WIDTH - ICON_WIDTH
    : TEXT_CONTENT_WIDTH;

  return (
    <Content onClick={() => onClick?.()}>
      {icon && <Icon type={icon} />}

      <TextContent width={textContentWidth}>
        <Title>{title}</Title>

        {subtitle && (
          <Typography.Body size="xsmall">{subtitle}</Typography.Body>
        )}
      </TextContent>

      <Icon type="ChevronRight" />
    </Content>
  );
};
