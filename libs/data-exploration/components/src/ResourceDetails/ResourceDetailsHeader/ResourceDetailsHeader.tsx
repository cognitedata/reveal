import React, { ReactNode } from 'react';

import styled from 'styled-components';

import { Button, Chip, IconType } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { TitleName } from '../../Common';

interface Props {
  icon?: IconType | ReactNode;
  title: string;
  isSelected?: boolean;
  showSelectButton?: boolean;
  onSelectClicked?: () => void;
  onClose?: () => void;
  closable?: boolean;
}
export const ResourceDetailsHeader: React.FC<Props> = ({
  title,
  icon,
  showSelectButton,
  isSelected,
  onSelectClicked,
  onClose,
  closable = true,
}) => {
  const { t } = useTranslation();
  return (
    <Container>
      <TitleRowWrapper data-testid="title-row-wrapper">
        {icon && <Icon icon={icon} data-testid="icon" />}
        <TitleName level={4}>{title}</TitleName>
      </TitleRowWrapper>
      <ActionsContainer>
        {showSelectButton && (
          <Button
            data-testid="select-button"
            icon={isSelected ? 'Checkmark' : 'Add'}
            iconPlacement="left"
            type="primary"
            disabled={isSelected}
            onClick={onSelectClicked}
          >
            {isSelected ? t('SELECTED', 'Selected') : t('SELECT', 'Select')}
          </Button>
        )}
        {closable && (
          <Button
            data-testid="close-button"
            icon="Close"
            type="ghost"
            onClick={onClose}
          ></Button>
        )}
      </ActionsContainer>
    </Container>
  );
};

const Icon: React.FC<{ icon: string | ReactNode }> = ({ icon }) => {
  if (typeof icon === 'string') {
    return <Chip icon={icon as any} aria-label={icon} type="neutral" />;
  }

  return <>{icon}</>;
};

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

export const TitleRowWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  overflow: hidden;
  vertical-align: bottom;
  flex: 1 1 auto;
`;
