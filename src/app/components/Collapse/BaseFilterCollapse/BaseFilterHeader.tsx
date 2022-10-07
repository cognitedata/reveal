import React from 'react';
import styled from 'styled-components';
import { Title as DefaultTitle, Body } from '@cognite/cogs.js';

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const BaseTitle = styled(DefaultTitle)`
  && {
    color: var(--cogs-greyscale-grey9);
  }
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
        <Body level={5}>Filters</Body>
      </Content>
    );
  });
