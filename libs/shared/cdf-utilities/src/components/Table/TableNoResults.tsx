import React, { ReactNode } from 'react';

import styled from 'styled-components';

import { Body, Colors, Detail } from '@cognite/cogs.js';

export type TableNoResultsProps = {
  title?: ReactNode;
  content?: ReactNode;
};

export const TableNoResults = ({
  title,
  content,
}: TableNoResultsProps): JSX.Element => {
  return (
    <StyledContainer>
      <Body level="2" strong>
        {title}
      </Body>
      <Detail>{content}</Detail>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  background: ${Colors['decorative--grayscale--100']};
  border-radius: 8px;
  padding: 12px;
`;
