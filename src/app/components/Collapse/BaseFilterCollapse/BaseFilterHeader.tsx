import React from 'react';
import styled from 'styled-components';
import { Title as DefaultTitle, Detail } from '@cognite/cogs.js';

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
`;

interface Props {
  title?: string;
  handleFilterClick?: () => void;
}
export const FilterHeader: React.FC<React.PropsWithChildren<Props>> =
  React.memo(({ title, handleFilterClick }) => {
    return (
      <Content>
        <BaseTitle level={6} onClick={handleFilterClick && handleFilterClick}>
          {title}
        </BaseTitle>
        <BaseSubtitle strong>Filters</BaseSubtitle>
      </Content>
    );
  });
