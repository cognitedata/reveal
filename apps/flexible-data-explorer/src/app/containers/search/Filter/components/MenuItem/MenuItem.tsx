import * as React from 'react';

import { Icon, IconType, Menu } from '@cognite/cogs.js';

import { Content, Subtitle, TextContent, Title } from './elements';

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
  return (
    <Menu.Item onClick={() => onClick?.()}>
      <Content>
        {icon && <Icon type={icon} />}

        <TextContent>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </TextContent>

        <Icon type="ChevronRight" />
      </Content>
    </Menu.Item>
  );
};
