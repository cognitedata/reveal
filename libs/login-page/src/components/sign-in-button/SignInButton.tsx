import React from 'react';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

type SignInButtonProps = {
  children: React.ReactNode;
  icon?: JSX.Element;
  disabled?: boolean;
  isLoading?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

const SignInButton = ({
  children,
  icon,
  disabled,
  isLoading,
  onClick,
}: SignInButtonProps): JSX.Element => {
  return (
    <StyledSignInButton
      disabled={disabled}
      loading={isLoading}
      onClick={onClick}
      type="secondary"
    >
      <StyledSignInButtonTypeIconContainer>
        {icon}
      </StyledSignInButtonTypeIconContainer>
      <StyledSignInButtonContent>{children}</StyledSignInButtonContent>
    </StyledSignInButton>
  );
};

const StyledSignInButton = styled(Button)`
  && {
    background-color: #f8f8f8;
    padding: 10px 12px;

    &:hover {
      background-color: #f1f1f1;
    }
  }

  height: fit-content;
  min-height: 40px;
  line-height: normal;

  :not(:last-child) {
    margin-bottom: 16px;
  }
`;

const StyledSignInButtonTypeIconContainer = styled.div`
  height: 16px;
  margin-right: 12px;
`;

const StyledSignInButtonContent = styled.div`
  flex: 1;
`;

export default SignInButton;
