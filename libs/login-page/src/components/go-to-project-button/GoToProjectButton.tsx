import React from 'react';

import styled from 'styled-components';

import { Body, Button, ButtonProps, Chip } from '@cognite/cogs.js';

import { useTranslation } from '../../common/i18n';

type GoToProjectButtonProps = {
  children: React.ReactNode;
  isSignInRequiredLabelShown?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
} & Pick<ButtonProps, 'disabled' | 'loading'>;

const GoToProjectButton = ({
  children,
  disabled,
  loading,
  isSignInRequiredLabelShown,
  onClick,
}: GoToProjectButtonProps): JSX.Element => {
  const { t } = useTranslation();
  return (
    <StyledGoToProjectButton
      disabled={disabled}
      icon="ChevronRightSmall"
      iconPlacement="right"
      loading={loading}
      onClick={onClick}
    >
      <StyledGoToProjectButtonContent>
        {children}
      </StyledGoToProjectButtonContent>
      {isSignInRequiredLabelShown && (
        <Chip
          size="small"
          type={disabled ? undefined : 'warning'}
          label={t('additional-sign-in')}
        />
      )}
    </StyledGoToProjectButton>
  );
};

const StyledGoToProjectButton = styled(Button)`
  && {
    background-color: #f8f8f8;

    &:hover {
      background-color: #f1f1f1;
    }
  }

  align-items: center;
  border: none;
  border-radius: 6px;

  display: flex;
  font-size: 14px;
  font-weight: 400;
  height: 40px;
  line-height: 20px;
  margin-bottom: 6px;
  padding: 10px 12px;
  text-align: left;
  width: 100%;
`;

const StyledGoToProjectButtonContent = styled(Body).attrs({
  level: 2,
  strong: true,
})`
  flex: 1;
`;

export default GoToProjectButton;
