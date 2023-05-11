import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { ButtonWrapper } from './elements';

export interface ApplyButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export const ApplyButton: React.FC<ApplyButtonProps> = ({
  disabled,
  onClick,
}) => {
  return (
    <ButtonWrapper>
      <Button disabled={disabled} onClick={onClick}>
        Apply
      </Button>
    </ButtonWrapper>
  );
};
