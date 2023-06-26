import React from 'react';

import styled from 'styled-components';

import { Title as DefaultTitle, Detail, Tooltip, Icon } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const BaseTitle = styled(DefaultTitle)`
  && {
    color: var(--cogs-greyscale-grey9);
  }
`;

const BaseSubtitle = styled(Detail)`
  color: var(--cogs-text-icon--muted);
  display: flex;
  align-items: center;
  gap: 4px;

  .cogs-tooltip__content {
    height: 12px;
  }
`;

export interface Props {
  title?: string;
  handleFilterClick?: () => void;
  infoContent?: string;
}
export const BaseFilterHeader: React.FC<React.PropsWithChildren<Props>> =
  React.memo(({ title, infoContent, handleFilterClick }) => {
    const { t } = useTranslation();

    return (
      <Content>
        <BaseTitle level={6} onClick={handleFilterClick && handleFilterClick}>
          {title}
        </BaseTitle>
        <BaseSubtitle strong>
          {t('FILTERS', 'Filters')}
          {infoContent && (
            <Tooltip content={infoContent}>
              <Icon type="Info" size={12} data-testid="header-info-icon" />
            </Tooltip>
          )}
        </BaseSubtitle>
      </Content>
    );
  });
