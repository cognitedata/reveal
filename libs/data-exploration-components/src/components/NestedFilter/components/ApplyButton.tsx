import * as React from 'react';

import { Button, Menu } from '@cognite/cogs.js';

import { ApplyButtonWrapper } from '../elements';

export interface ApplyButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export const ApplyButton: React.FC<ApplyButtonProps> = ({
  disabled,
  onClick,
}) => {
  return (
    <React.Fragment>
      <Menu.Divider />

      <ApplyButtonWrapper>
        <Button
          data-testid="apply-button"
          type="primary"
          disabled={disabled}
          onClick={onClick}
        >
          Apply
        </Button>
      </ApplyButtonWrapper>
    </React.Fragment>
  );
};
