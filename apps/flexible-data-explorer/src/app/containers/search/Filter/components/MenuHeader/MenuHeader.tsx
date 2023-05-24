import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { Container, Title } from './elements';

export interface MenuHeaderProps {
  title: string;
  onBackClick?: () => void;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  title,
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

      <Title>{title}</Title>
    </Container>
  );
};
