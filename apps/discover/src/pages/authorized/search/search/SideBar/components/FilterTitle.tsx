import React, { ReactNode } from 'react';

import styled from 'styled-components/macro';

import { Title as DefaultTitle } from '@cognite/cogs.js';

import { Flex, FlexColumn } from 'styles/layout';

const BaseTitle = styled(DefaultTitle)`
  && {
    align-self: center;
    display: inline-block;
    color: var(--cogs-greyscale-grey9);
  }
`;

const FilterItemTitle = styled(BaseTitle)`
  cursor: pointer;
  user-select: none;
`;

const Content = styled(Flex)`
  align-items: center;
`;

const Container = styled(FlexColumn)`
  width: 100%;
  height: 100%;
  justify-content: center;
`;

interface Props {
  title?: string;
  iconElement?: ReactNode;
  handleFilterClick?: () => void;
  header?: boolean;
}
// Show font 2 and filter label
export const FilterTitle: React.FC<React.PropsWithChildren<Props>> = React.memo(
  ({ children, title, iconElement, handleFilterClick, header }) => {
    const TitleWrapper = header ? BaseTitle : FilterItemTitle;
    const renderTitle = React.useMemo(
      () => (
        <TitleWrapper
          data-test-filter-title={title}
          level={header ? 5 : 6}
          onClick={handleFilterClick && handleFilterClick}
        >
          {iconElement || title}
        </TitleWrapper>
      ),
      [title, header]
    );
    return (
      <Container>
        <Content>
          {renderTitle}
          {children}
        </Content>
      </Container>
    );
  }
);
