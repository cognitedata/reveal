import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { Container, Subtitle, TextContent, Title } from './elements';

export interface MenuHeaderProps {
  title: string;
  subtitle?: string;
  onBackClick?: () => void;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  title,
  subtitle,
  onBackClick,
}) => {
  return (
    <Container>
      {onBackClick && (
        <Button
          icon="ChevronLeft"
          type="ghost"
          size="small"
          aria-label="menu-title-back"
          onClick={() => onBackClick()}
        />
      )}

      <TextContent>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
        <Title>{title}</Title>
      </TextContent>
    </Container>
  );
};
