import * as React from 'react';

import styled from 'styled-components/macro';

import { Button } from '@cognite/cogs.js';

export interface ThreeDButtonProps {
  text?: string;
  disabled?: boolean;
  onClick: () => void;
}

export const ThreeDButton: React.FC<ThreeDButtonProps> = ({
  text,
  disabled,
  onClick,
}) => {
  return (
    <ButtonWrapper
      type="secondary"
      icon="Cube"
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </ButtonWrapper>
  );
};

const ButtonWrapper = styled(Button)`
  &&& {
    padding: 8px, 10px, 8px, 10px;
    border-radius: 100px;
    background-color: #ffffff;
  }
`;
