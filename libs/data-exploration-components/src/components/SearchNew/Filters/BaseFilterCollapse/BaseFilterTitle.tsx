import React from 'react';
import styled from 'styled-components';
import { Title as DefaultTitle } from '@cognite/cogs.js';

const Content = styled.div`
  display: flex;
  align-items: center;
`;

const ContainerTitle = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
`;

const BaseTitle = styled(DefaultTitle)`
  && {
    align-self: center;
    display: inline-block;
    color: var(--cogs-greyscale-grey9);
  }
`;

// const FilterItemTitle = styled(BaseTitle)`
//   cursor: pointer;
//   user-select: none;
// `;

interface Props {
  title?: string;
  handleFilterClick?: () => void;
}
// Show font 2 and filter label
export const FilterTitle: React.FC<React.PropsWithChildren<Props>> = React.memo(
  ({ children, title, handleFilterClick }) => {
    const renderTitle = React.useMemo(
      () => (
        <BaseTitle level={6} onClick={handleFilterClick && handleFilterClick}>
          {title}
        </BaseTitle>
      ),
      [title, handleFilterClick]
    );
    return (
      <ContainerTitle>
        <Content>
          {renderTitle}
          {children}
        </Content>
      </ContainerTitle>
    );
  }
);
