import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { ButtonWrapper } from './elements';

export interface MenuFooterButtonProps {
  text: string;
  disabled?: boolean;
  onClick: () => void;
}

export const MenuFooterButton: React.FC<MenuFooterButtonProps> = ({
  text,
  disabled,
  onClick,
}) => {
  return (
    <ButtonWrapper>
      <Button disabled={disabled} onClick={onClick}>
        {text}
      </Button>
    </ButtonWrapper>
  );
};
