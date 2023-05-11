import * as React from 'react';

import { Icon, IconType } from '@cognite/cogs.js';

import { Container, Subtitle, TextContent, Title } from './elements';

export interface MenuItemProps {
  title: string;
  subtitle?: string;
  icon?: IconType;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  title,
  subtitle,
  icon,
}) => {
  return (
    <Container>
      {icon && <Icon type={icon} />}

      <TextContent>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </TextContent>

      <Icon type="ChevronRight" />
    </Container>
  );
};
