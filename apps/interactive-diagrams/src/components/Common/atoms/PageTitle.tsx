import React from 'react';

import styled from 'styled-components';

import { Title, Body, Colors } from '@cognite/cogs.js';

import { Flex } from './Flex';

interface PageTitleProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  style?: React.CSSProperties;
  hasUnderline?: boolean;
}

const StyledTitle = styled(Title)`
  font-weight: 700;
  margin-bottom: 8px;
`;
const StyledSubtitle = styled(Body)`
  font-weight: 400;
  size: 16px;
  line-height: 24px;
  color: ${Colors['decorative--grayscale--700']};
  margin-bottom: 12px;
  box-sizing: border-box;
`;

const Line = styled.div`
  width: 36px;
  height: 4px;
  margin-top: 8px;
  background: ${Colors['decorative--pink--300']};
`;

export const PageTitle = (props: PageTitleProps) => {
  const { title, subtitle, hasUnderline = false, style } = props;
  return (
    <Flex column>
      <StyledTitle level={3} style={style} data-testid="step-title">
        {title}
      </StyledTitle>
      {subtitle && (
        <StyledSubtitle level={1} style={style}>
          {subtitle}
        </StyledSubtitle>
      )}
      {hasUnderline && <Line />}
    </Flex>
  );
};
