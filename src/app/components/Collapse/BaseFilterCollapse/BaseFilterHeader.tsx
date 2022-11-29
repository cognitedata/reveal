import React from 'react';
import styled from 'styled-components';
import { Title as DefaultTitle, Detail, Tooltip, Icon } from '@cognite/cogs.js';

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

interface Props {
  title?: string;
  handleFilterClick?: () => void;
  infoContent?: string;
}
export const FilterHeader: React.FC<React.PropsWithChildren<Props>> =
  React.memo(({ title, infoContent, handleFilterClick }) => {
    return (
      <Content>
        <BaseTitle level={6} onClick={handleFilterClick && handleFilterClick}>
          {title}
        </BaseTitle>
        <BaseSubtitle strong>
          Filters
          {infoContent && (
            <Tooltip content={infoContent}>
              <Icon type="Info" size={12} />
            </Tooltip>
          )}
        </BaseSubtitle>
      </Content>
    );
  });
