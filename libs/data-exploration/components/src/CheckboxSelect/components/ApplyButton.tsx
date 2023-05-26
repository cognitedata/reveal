import * as React from 'react';

import styled from 'styled-components';

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
        <StyledButton
          data-testid="apply-button"
          type="primary"
          disabled={disabled}
          onClick={onClick}
        >
          Apply
        </StyledButton>
      </ApplyButtonWrapper>
    </React.Fragment>
  );
};

const StyledButton = styled(Button)`
  width: 100%;
`;
