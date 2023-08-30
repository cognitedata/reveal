import React from 'react';

import styled from 'styled-components';

import { Background as BG } from '@cognite/cdf-utilities';

import { BREAKPOINT_WIDTH } from '../../utils';

interface Props {
  children: React.ReactNode | null;
}
export const Background = ({ children }: Props) => {
  return (
    <BG rotatePeriod={30 * 60 * 1000} breakpointWidth={BREAKPOINT_WIDTH}>
      <StyledCenteredOnDesktop>{children}</StyledCenteredOnDesktop>
    </BG>
  );
};

const StyledCenteredOnDesktop = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;

  @media (max-width: ${BREAKPOINT_WIDTH}px) {
    justify-content: flex-start;
    padding-top: 78px;
  }
`;
